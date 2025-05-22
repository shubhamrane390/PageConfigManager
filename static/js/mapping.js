/**
 * Mapping page configurations to organizations
 */

onDOMReady(() => {
    // Mapping page
    const mappingContainer = document.getElementById('mappingContainer');
    if (mappingContainer) {
        const orgId = mappingContainer.dataset.organizationId;
        loadMappingData(orgId);
    }
    
    // Save mappings button
    const saveMappingsBtn = document.getElementById('saveMappingsBtn');
    if (saveMappingsBtn) {
        saveMappingsBtn.addEventListener('click', handleSaveMappings);
    }
});

/**
 * Loads mapping data for an organization
 * @param {number} orgId - Organization ID
 */
async function loadMappingData(orgId) {
    try {
        Helpers.showLoading('Loading mapping data...');
        
        // Load organization details
        const orgResponse = await Helpers.fetchAPI(API.ORGANIZATION.DETAIL(orgId), {
            method: 'GET'
        });
        
        // Load all page configurations
        const configsResponse = await Helpers.fetchAPI(API.PAGE_CONFIG.LIST, {
            method: 'GET'
        });
        
        // Load existing mappings
        const mappingsResponse = await Helpers.fetchAPI(API.MAPPING.MAP_PAGES(orgId), {
            method: 'GET'
        });
        
        Helpers.hideLoading();
        
        if (orgResponse && configsResponse) {
            renderMappingInterface(orgResponse, configsResponse, mappingsResponse || { mappings: [] });
        }
    } catch (error) {
        Helpers.hideLoading();
        const container = document.getElementById('mappingContainer');
        Helpers.showAlert(error.message || 'Failed to load mapping data', 'danger', container);
    }
}

/**
 * Renders the mapping interface
 * @param {Object} organization - Organization data
 * @param {Array} configurations - All page configurations
 * @param {Object} mappings - Existing mappings
 */
function renderMappingInterface(organization, configurations, mappings) {
    const container = document.getElementById('mappingContainer');
    const orgNameElem = document.getElementById('orgName');
    const mappingsTableContainer = document.getElementById('mappingsTableContainer');
    
    orgNameElem.textContent = organization.name;
    
    // Group configurations by page identifier
    const groupedConfigs = {};
    configurations.forEach(config => {
        if (!groupedConfigs[config.page_identifier]) {
            groupedConfigs[config.page_identifier] = [];
        }
        groupedConfigs[config.page_identifier].push(config);
    });
    
    mappingsTableContainer.innerHTML = '';
    
    // For each page, create a mapping section
    Object.keys(groupedConfigs).sort().forEach(pageId => {
        const pageConfigs = groupedConfigs[pageId];
        pageConfigs.sort((a, b) => a.display_order - b.display_order);
        
        const pageSection = document.createElement('div');
        pageSection.className = 'card mb-3';
        
        const pageHeader = document.createElement('div');
        pageHeader.className = 'card-header';
        pageHeader.innerHTML = `
            <h3 class="card-title">${pageId}</h3>
        `;
        
        const pageBody = document.createElement('div');
        pageBody.className = 'card-body';
        
        // Create table for mapping
        const table = document.createElement('table');
        table.className = 'table';
        
        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Display Order</th>
                <th>Component Type</th>
                <th>Default Name</th>
                <th>Custom Name</th>
                <th>Visible</th>
            </tr>
        `;
        
        // Table body
        const tbody = document.createElement('tbody');
        
        pageConfigs.forEach(config => {
            // Find existing mapping for this config
            const existingMapping = mappings.mappings.find(m => m.page_configuration === config.id);
            
            const tr = document.createElement('tr');
            tr.dataset.configId = config.id;
            tr.innerHTML = `
                <td>${config.display_order}</td>
                <td>${config.component_type || 'N/A'}</td>
                <td>${config.custom_name || 'N/A'}</td>
                <td>
                    <input type="text" class="custom-name-input" 
                           value="${existingMapping?.custom_name || config.custom_name || ''}" 
                           data-original="${config.custom_name || ''}">
                </td>
                <td>
                    <input type="checkbox" class="visibility-checkbox" 
                           ${existingMapping?.is_visible !== false ? 'checked' : ''}>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        pageBody.appendChild(table);
        
        pageSection.appendChild(pageHeader);
        pageSection.appendChild(pageBody);
        mappingsTableContainer.appendChild(pageSection);
    });
    
    // Enable save button
    document.getElementById('saveMappingsBtn').disabled = false;
}

/**
 * Handles saving mappings
 */
async function handleSaveMappings() {
    const orgId = document.getElementById('mappingContainer').dataset.organizationId;
    
    try {
        // Collect mapping data
        const mappings = [];
        
        document.querySelectorAll('#mappingsTableContainer tr[data-config-id]').forEach(row => {
            const configId = parseInt(row.dataset.configId);
            const customNameInput = row.querySelector('.custom-name-input');
            const visibilityCheckbox = row.querySelector('.visibility-checkbox');
            
            const customName = customNameInput.value.trim();
            const isVisible = visibilityCheckbox.checked;
            
            // Only add to mappings if something is changed
            if (customName !== customNameInput.dataset.original || !isVisible) {
                mappings.push({
                    page_configuration: configId,
                    custom_name: customName,
                    is_visible: isVisible
                });
            }
        });
        
        Helpers.showLoading('Saving mappings...');
        
        const response = await Helpers.fetchAPI(API.MAPPING.MAP_PAGES(orgId), {
            method: 'POST',
            body: JSON.stringify({ mappings })
        });
        
        Helpers.hideLoading();
        
        if (response) {
            Helpers.showAlert('Mappings saved successfully!', 'success', document.getElementById('mappingContainer'));
            
            // Reload mapping data to get fresh state
            loadMappingData(orgId);
        } else {
            throw new Error('Failed to save mappings');
        }
    } catch (error) {
        Helpers.hideLoading();
        Helpers.showAlert(error.message || 'Failed to save mappings', 'danger', document.getElementById('mappingContainer'));
    }
}
