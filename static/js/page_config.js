/**
 * Page configuration management functionality
 */

onDOMReady(() => {
    // Page configuration list
    const pageConfigContainer = document.getElementById('pageConfigContainer');
    if (pageConfigContainer) {
        loadPageConfigurations();
    }
    
    // Add page config button
    const addPageConfigBtn = document.getElementById('addPageConfigBtn');
    if (addPageConfigBtn) {
        addPageConfigBtn.addEventListener('click', handleAddPageConfig);
    }
    
    // Bulk upload button
    const bulkUploadBtn = document.getElementById('bulkUploadBtn');
    if (bulkUploadBtn) {
        bulkUploadBtn.addEventListener('click', handleBulkUpload);
    }
});

/**
 * Loads page configurations
 */
async function loadPageConfigurations() {
    try {
        Helpers.showLoading('Loading page configurations...');
        
        const response = await Helpers.fetchAPI(API.PAGE_CONFIG.LIST, {
            method: 'GET'
        });
        
        Helpers.hideLoading();
        
        if (response) {
            renderPageConfigurations(response);
        }
    } catch (error) {
        Helpers.hideLoading();
        const container = document.getElementById('pageConfigContainer');
        Helpers.showAlert(error.message || 'Failed to load page configurations', 'danger', container);
    }
}

/**
 * Renders page configurations
 * @param {Array} configurations - Page configuration data
 */
function renderPageConfigurations(configurations) {
    const container = document.getElementById('pageConfigContainer');
    const tableContainer = document.getElementById('pageConfigTableContainer');
    
    if (!configurations || configurations.length === 0) {
        tableContainer.innerHTML = '<p>No page configurations found.</p>';
        return;
    }
    
    // Group configurations by page identifier
    const groupedConfigs = {};
    configurations.forEach(config => {
        if (!groupedConfigs[config.page_identifier]) {
            groupedConfigs[config.page_identifier] = [];
        }
        groupedConfigs[config.page_identifier].push(config);
    });
    
    tableContainer.innerHTML = '';
    
    // Create accordion for each page
    Object.keys(groupedConfigs).forEach(pageId => {
        const pageConfigs = groupedConfigs[pageId];
        
        const accordion = document.createElement('div');
        accordion.className = 'accordion mb-3';
        
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <button class="btn btn-secondary btn-block text-left d-flex align-items-center justify-content-between">
                <span>${pageId}</span>
                <span class="badge">${pageConfigs.length} items</span>
            </button>
        `;
        
        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.style.display = 'none';
        
        // Create table for this page's configurations
        const table = document.createElement('table');
        table.className = 'table';
        
        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Display Order</th>
                <th>Component Type</th>
                <th>Custom Name</th>
                <th>Default Label</th>
                <th>Actions</th>
            </tr>
        `;
        
        // Table body
        const tbody = document.createElement('tbody');
        
        // Sort by display order
        pageConfigs.sort((a, b) => a.display_order - b.display_order);
        
        pageConfigs.forEach(config => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${config.display_order}</td>
                <td>${config.component_type || 'N/A'}</td>
                <td>${config.custom_name || 'N/A'}</td>
                <td>${config.default_label || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-config" data-id="${config.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-config" data-id="${config.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        content.appendChild(table);
        
        accordion.appendChild(header);
        accordion.appendChild(content);
        tableContainer.appendChild(accordion);
        
        // Toggle accordion on header click
        header.querySelector('button').addEventListener('click', () => {
            if (content.style.display === 'none') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
        
        // Add event listeners to buttons
        content.querySelectorAll('.edit-config').forEach(btn => {
            btn.addEventListener('click', () => handleEditPageConfig(btn.dataset.id));
        });
        
        content.querySelectorAll('.delete-config').forEach(btn => {
            btn.addEventListener('click', () => handleDeletePageConfig(btn.dataset.id));
        });
    });
}

/**
 * Handles adding a new page configuration
 */
function handleAddPageConfig() {
    // Create modal for adding page config
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = 'var(--border-radius)';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    
    modalContent.innerHTML = `
        <h3 class="mb-2">Add Page Configuration</h3>
        <form id="addPageConfigForm">
            <div class="form-group">
                <label for="pageIdentifier">Page Identifier</label>
                <input type="text" id="pageIdentifier" name="page_identifier" required>
                <small>Example: NAVBAR, DASHBOARD, etc.</small>
            </div>
            <div class="form-group">
                <label for="componentType">Component Type</label>
                <input type="text" id="componentType" name="component_type" required>
                <small>Example: BUTTON, MENU_ITEM, etc.</small>
            </div>
            <div class="form-group">
                <label for="displayOrder">Display Order</label>
                <input type="number" id="displayOrder" name="display_order" min="1" required>
            </div>
            <div class="form-group">
                <label for="customName">Custom Name</label>
                <input type="text" id="customName" name="custom_name" required>
            </div>
            <div class="form-group">
                <label for="defaultLabel">Default Label</label>
                <input type="text" id="defaultLabel" name="default_label">
            </div>
            <div class="form-group text-right">
                <button type="button" class="btn btn-danger cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Configuration</button>
            </div>
        </form>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Handle close modal
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Handle submit form
    modal.querySelector('#addPageConfigForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        if (!Helpers.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const configData = {
            page_identifier: formData.get('page_identifier'),
            component_type: formData.get('component_type'),
            display_order: parseInt(formData.get('display_order')),
            custom_name: formData.get('custom_name'),
            default_label: formData.get('default_label') || null
        };
        
        try {
            Helpers.showLoading('Adding page configuration...');
            
            const response = await Helpers.fetchAPI(API.PAGE_CONFIG.LIST, {
                method: 'POST',
                body: JSON.stringify(configData)
            });
            
            Helpers.hideLoading();
            
            if (response) {
                modal.remove();
                Helpers.showAlert('Page configuration added successfully!', 'success', document.getElementById('pageConfigContainer'));
                
                // Reload page configurations
                loadPageConfigurations();
            } else {
                throw new Error('Failed to add page configuration');
            }
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showAlert(error.message || 'Failed to add page configuration', 'danger', form.parentNode);
        }
    });
}

/**
 * Handles editing a page configuration
 * @param {number} configId - Configuration ID
 */
async function handleEditPageConfig(configId) {
    try {
        Helpers.showLoading('Loading configuration details...');
        
        // Get configuration details
        const response = await Helpers.fetchAPI(`${API.PAGE_CONFIG.LIST}${configId}/`, {
            method: 'GET'
        });
        
        Helpers.hideLoading();
        
        if (!response) {
            throw new Error('Failed to load configuration details');
        }
        
        const config = response;
        
        // Create modal for editing page config
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = 'var(--border-radius)';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '500px';
        
        modalContent.innerHTML = `
            <h3 class="mb-2">Edit Page Configuration</h3>
            <form id="editPageConfigForm">
                <div class="form-group">
                    <label for="pageIdentifier">Page Identifier</label>
                    <input type="text" id="pageIdentifier" name="page_identifier" value="${config.page_identifier}" required>
                </div>
                <div class="form-group">
                    <label for="componentType">Component Type</label>
                    <input type="text" id="componentType" name="component_type" value="${config.component_type || ''}" required>
                </div>
                <div class="form-group">
                    <label for="displayOrder">Display Order</label>
                    <input type="number" id="displayOrder" name="display_order" value="${config.display_order}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="customName">Custom Name</label>
                    <input type="text" id="customName" name="custom_name" value="${config.custom_name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="defaultLabel">Default Label</label>
                    <input type="text" id="defaultLabel" name="default_label" value="${config.default_label || ''}">
                </div>
                <div class="form-group text-right">
                    <button type="button" class="btn btn-danger cancel-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Configuration</button>
                </div>
            </form>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Handle close modal
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Handle submit form
        modal.querySelector('#editPageConfigForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const form = e.target;
            if (!Helpers.validateForm(form)) {
                return;
            }
            
            const formData = new FormData(form);
            const configData = {
                page_identifier: formData.get('page_identifier'),
                component_type: formData.get('component_type'),
                display_order: parseInt(formData.get('display_order')),
                custom_name: formData.get('custom_name'),
                default_label: formData.get('default_label') || null
            };
            
            try {
                Helpers.showLoading('Updating page configuration...');
                
                const updateResponse = await Helpers.fetchAPI(`${API.PAGE_CONFIG.LIST}${configId}/`, {
                    method: 'PUT',
                    body: JSON.stringify(configData)
                });
                
                Helpers.hideLoading();
                
                if (updateResponse) {
                    modal.remove();
                    Helpers.showAlert('Page configuration updated successfully!', 'success', document.getElementById('pageConfigContainer'));
                    
                    // Reload page configurations
                    loadPageConfigurations();
                } else {
                    throw new Error('Failed to update page configuration');
                }
            } catch (updateError) {
                Helpers.hideLoading();
                Helpers.showAlert(updateError.message || 'Failed to update page configuration', 'danger', form.parentNode);
            }
        });
    } catch (error) {
        Helpers.hideLoading();
        Helpers.showAlert(error.message || 'Failed to load configuration details', 'danger', document.getElementById('pageConfigContainer'));
    }
}

/**
 * Handles deleting a page configuration
 * @param {number} configId - Configuration ID
 */
function handleDeletePageConfig(configId) {
    if (!confirm('Are you sure you want to delete this page configuration?')) {
        return;
    }
    
    try {
        Helpers.showLoading('Deleting page configuration...');
        
        Helpers.fetchAPI(`${API.PAGE_CONFIG.LIST}${configId}/`, {
            method: 'DELETE'
        }).then(() => {
            Helpers.hideLoading();
            
            Helpers.showAlert('Page configuration deleted successfully!', 'success', document.getElementById('pageConfigContainer'));
            
            // Reload page configurations
            loadPageConfigurations();
        }).catch(error => {
            throw error;
        });
    } catch (error) {
        Helpers.hideLoading();
        Helpers.showAlert(error.message || 'Failed to delete page configuration', 'danger', document.getElementById('pageConfigContainer'));
    }
}

/**
 * Handles bulk uploading page configurations
 */
function handleBulkUpload() {
    // Create modal for bulk upload
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = 'var(--border-radius)';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '600px';
    
    modalContent.innerHTML = `
        <h3 class="mb-2">Bulk Upload Page Configurations</h3>
        <p class="mb-2">Enter JSON data for multiple page configurations:</p>
        <form id="bulkUploadForm">
            <div class="form-group">
                <textarea id="bulkConfigData" name="bulk_data" rows="10" required
                    placeholder='[{
    "page_identifier": "NAVBAR",
    "component_type": "MENU_ITEM",
    "display_order": 1,
    "custom_name": "Dashboard",
    "default_label": "Dashboard"
}, ...]'></textarea>
            </div>
            <div class="form-group text-right">
                <button type="button" class="btn btn-danger cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Upload Configurations</button>
            </div>
        </form>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Handle close modal
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Handle submit form
    modal.querySelector('#bulkUploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        if (!Helpers.validateForm(form)) {
            return;
        }
        
        try {
            const bulkDataString = form.elements.bulk_data.value;
            let bulkData;
            
            try {
                bulkData = JSON.parse(bulkDataString);
                if (!Array.isArray(bulkData)) {
                    throw new Error('Data must be an array of configurations');
                }
            } catch (parseError) {
                Helpers.showAlert('Invalid JSON format: ' + parseError.message, 'danger', form.parentNode);
                return;
            }
            
            Helpers.showLoading('Uploading page configurations...');
            
            const response = await Helpers.fetchAPI(API.PAGE_CONFIG.LIST, {
                method: 'POST',
                body: JSON.stringify(bulkData)
            });
            
            Helpers.hideLoading();
            
            if (response) {
                modal.remove();
                Helpers.showAlert('Page configurations uploaded successfully!', 'success', document.getElementById('pageConfigContainer'));
                
                // Reload page configurations
                loadPageConfigurations();
            } else {
                throw new Error('Failed to upload page configurations');
            }
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showAlert(error.message || 'Failed to upload page configurations', 'danger', form.parentNode);
        }
    });
}
