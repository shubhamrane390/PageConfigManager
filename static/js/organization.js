/**
 * Organization management functionality
 */

onDOMReady(() => {
    // Organization creation form
    const createOrgForm = document.getElementById('createOrganizationForm');
    if (createOrgForm) {
        createOrgForm.addEventListener('submit', handleCreateOrganization);
    }
    
    // Organization detail view
    const orgDetailContainer = document.getElementById('organizationDetail');
    if (orgDetailContainer) {
        const orgId = orgDetailContainer.dataset.organizationId;
        loadOrganizationDetails(orgId);
    }
    
    // Add member button in organization detail
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', handleAddMember);
    }
});

/**
 * Handles organization creation form submission
 * @param {Event} event - Form submit event
 */
async function handleCreateOrganization(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!Helpers.validateForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    const organizationData = {
        name: formData.get('name'),
        description: formData.get('description'),
        parent_organization: formData.get('parent_organization') || null
    };
    
    try {
        Helpers.showLoading('Creating organization...');
        
        const response = await Helpers.fetchAPI(API.ORGANIZATION.CREATE, {
            method: 'POST',
            body: JSON.stringify(organizationData)
        });
        
        Helpers.hideLoading();
        
        if (response.id) {
            // Show success message
            Helpers.showAlert('Organization created successfully!', 'success', form.parentNode);
            
            // Redirect to the organization detail page
            setTimeout(() => {
                window.location.href = API.ORGANIZATION.DETAIL(response.id);
            }, 1500);
        } else {
            throw new Error('Failed to create organization');
        }
    } catch (error) {
        Helpers.hideLoading();
        Helpers.showAlert(error.message || 'Failed to create organization', 'danger', form.parentNode);
    }
}

/**
 * Loads organization details
 * @param {number} orgId - Organization ID
 */
async function loadOrganizationDetails(orgId) {
    try {
        Helpers.showLoading('Loading organization details...');
        
        const response = await Helpers.fetchAPI(API.ORGANIZATION.DETAIL(orgId), {
            method: 'GET'
        });
        
        Helpers.hideLoading();
        
        if (response) {
            renderOrganizationDetails(response);
        }
    } catch (error) {
        Helpers.hideLoading();
        const container = document.getElementById('organizationDetail');
        Helpers.showAlert(error.message || 'Failed to load organization details', 'danger', container);
    }
}

/**
 * Renders organization details
 * @param {Object} organization - Organization data
 */
function renderOrganizationDetails(organization) {
    const container = document.getElementById('organizationDetail');
    const detailsContainer = document.getElementById('orgDetailsContainer');
    const membersContainer = document.getElementById('orgMembersContainer');
    
    // Update organization details
    const nameElement = detailsContainer.querySelector('.org-name');
    const descElement = detailsContainer.querySelector('.org-description');
    const parentElement = detailsContainer.querySelector('.org-parent');
    const createdElement = detailsContainer.querySelector('.org-created');
    
    nameElement.textContent = organization.name;
    descElement.textContent = organization.description || 'No description provided';
    parentElement.textContent = organization.parent_organization ? 
        organization.parent_organization.name : 'No parent organization';
    createdElement.textContent = Helpers.formatDate(organization.created_at);
    
    // Render members
    membersContainer.innerHTML = '';
    
    if (organization.members && organization.members.length > 0) {
        const table = document.createElement('table');
        table.className = 'table';
        
        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Actions</th>
            </tr>
        `;
        
        // Table body
        const tbody = document.createElement('tbody');
        organization.members.forEach(member => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${member.user.first_name} ${member.user.last_name}</td>
                <td>${member.role || 'Member'}</td>
                <td>${member.user.email}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-member" data-id="${member.id}">Edit</button>
                    <button class="btn btn-sm btn-danger remove-member" data-id="${member.id}">Remove</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        membersContainer.appendChild(table);
        
        // Add event listeners to buttons
        membersContainer.querySelectorAll('.edit-member').forEach(btn => {
            btn.addEventListener('click', () => handleEditMember(btn.dataset.id));
        });
        
        membersContainer.querySelectorAll('.remove-member').forEach(btn => {
            btn.addEventListener('click', () => handleRemoveMember(btn.dataset.id));
        });
    } else {
        membersContainer.innerHTML = '<p>No members in this organization.</p>';
    }
    
    // Render hierarchy
    const hierarchyContainer = document.getElementById('orgHierarchyContainer');
    if (hierarchyContainer && organization.hierarchy) {
        renderOrganizationHierarchy(organization.hierarchy, hierarchyContainer);
    }
}

/**
 * Renders organization hierarchy
 * @param {Object} node - Hierarchy node
 * @param {HTMLElement} container - Container to render in
 * @param {number} level - Hierarchy level (for indentation)
 */
function renderOrganizationHierarchy(node, container, level = 0) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'hierarchy-node';
    
    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-content';
    
    if (level > 0) {
        nodeContent.style.marginLeft = `${level * 20}px`;
    }
    
    nodeContent.innerHTML = `
        <div class="node-name">${node.name}</div>
        <div class="node-actions">
            <button class="btn btn-sm btn-primary view-org" data-id="${node.id}">View</button>
        </div>
    `;
    
    nodeElement.appendChild(nodeContent);
    container.appendChild(nodeElement);
    
    // Process children
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            renderOrganizationHierarchy(child, container, level + 1);
        });
    }
    
    // Add event listener to view button
    nodeElement.querySelector('.view-org').addEventListener('click', (e) => {
        const orgId = e.target.dataset.id;
        window.location.href = API.ORGANIZATION.DETAIL(orgId);
    });
}

/**
 * Handles adding a new member to the organization
 */
function handleAddMember() {
    const orgId = document.getElementById('organizationDetail').dataset.organizationId;
    
    // Create modal for adding member
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
        <h3 class="mb-2">Add Member to Organization</h3>
        <form id="addMemberForm">
            <div class="form-group">
                <label for="memberEmail">Email</label>
                <input type="email" id="memberEmail" name="email" required>
            </div>
            <div class="form-group">
                <label for="memberRole">Role</label>
                <select id="memberRole" name="role" required>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member" selected>Member</option>
                    <option value="viewer">Viewer</option>
                </select>
            </div>
            <div class="form-group text-right">
                <button type="button" class="btn btn-danger cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Member</button>
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
    modal.querySelector('#addMemberForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        if (!Helpers.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const memberData = {
            email: formData.get('email'),
            role: formData.get('role'),
            organization: orgId
        };
        
        try {
            Helpers.showLoading('Adding member...');
            
            const response = await Helpers.fetchAPI(`${API.ORGANIZATION.DETAIL(orgId)}/members/`, {
                method: 'POST',
                body: JSON.stringify(memberData)
            });
            
            Helpers.hideLoading();
            
            if (response.success) {
                modal.remove();
                Helpers.showAlert('Member added successfully!', 'success', document.getElementById('organizationDetail'));
                
                // Reload organization details
                loadOrganizationDetails(orgId);
            } else {
                throw new Error(response.message || 'Failed to add member');
            }
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showAlert(error.message || 'Failed to add member', 'danger', form.parentNode);
        }
    });
}

/**
 * Handles editing a member
 * @param {number} memberId - Member ID
 */
function handleEditMember(memberId) {
    const orgId = document.getElementById('organizationDetail').dataset.organizationId;
    
    // Find member data
    const memberRow = document.querySelector(`[data-id="${memberId}"]`).closest('tr');
    const memberName = memberRow.cells[0].textContent;
    const memberRole = memberRow.cells[1].textContent;
    
    // Create modal for editing member
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
        <h3 class="mb-2">Edit Member: ${memberName}</h3>
        <form id="editMemberForm">
            <div class="form-group">
                <label for="memberRole">Role</label>
                <select id="memberRole" name="role" required>
                    <option value="admin" ${memberRole === 'Admin' ? 'selected' : ''}>Admin</option>
                    <option value="manager" ${memberRole === 'Manager' ? 'selected' : ''}>Manager</option>
                    <option value="member" ${memberRole === 'Member' ? 'selected' : ''}>Member</option>
                    <option value="viewer" ${memberRole === 'Viewer' ? 'selected' : ''}>Viewer</option>
                </select>
            </div>
            <div class="form-group text-right">
                <button type="button" class="btn btn-danger cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Member</button>
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
    modal.querySelector('#editMemberForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        if (!Helpers.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        const memberData = {
            role: formData.get('role')
        };
        
        try {
            Helpers.showLoading('Updating member...');
            
            const response = await Helpers.fetchAPI(`${API.ORGANIZATION.DETAIL(orgId)}/members/${memberId}/`, {
                method: 'PATCH',
                body: JSON.stringify(memberData)
            });
            
            Helpers.hideLoading();
            
            if (response.success) {
                modal.remove();
                Helpers.showAlert('Member updated successfully!', 'success', document.getElementById('organizationDetail'));
                
                // Reload organization details
                loadOrganizationDetails(orgId);
            } else {
                throw new Error(response.message || 'Failed to update member');
            }
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showAlert(error.message || 'Failed to update member', 'danger', form.parentNode);
        }
    });
}

/**
 * Handles removing a member
 * @param {number} memberId - Member ID
 */
function handleRemoveMember(memberId) {
    const orgId = document.getElementById('organizationDetail').dataset.organizationId;
    
    if (!confirm('Are you sure you want to remove this member from the organization?')) {
        return;
    }
    
    try {
        Helpers.showLoading('Removing member...');
        
        Helpers.fetchAPI(`${API.ORGANIZATION.DETAIL(orgId)}/members/${memberId}/`, {
            method: 'DELETE'
        }).then(response => {
            Helpers.hideLoading();
            
            Helpers.showAlert('Member removed successfully!', 'success', document.getElementById('organizationDetail'));
            
            // Reload organization details
            loadOrganizationDetails(orgId);
        }).catch(error => {
            throw error;
        });
    } catch (error) {
        Helpers.hideLoading();
        Helpers.showAlert(error.message || 'Failed to remove member', 'danger', document.getElementById('organizationDetail'));
    }
}
