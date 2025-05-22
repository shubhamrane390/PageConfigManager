/**
 * Common utilities for the access control system
 */

// API endpoints
const API = {
    ORGANIZATION: {
        CREATE: '/create_organisation/',
        DETAIL: (id) => `/organisations/${id}/`,
        LIST: '/organisations/list/',
    },
    PAGE_CONFIG: {
        LIST: '/page_configs/',
    },
    MAPPING: {
        MAP_PAGES: (id) => `/map_org_pages/${id}/`,
    }
};

// Helper functions
const Helpers = {
    /**
     * Shows an alert message
     * @param {string} message - Message to display
     * @param {string} type - Alert type (success, danger, warning)
     * @param {HTMLElement} container - Container to append the alert to
     */
    showAlert: function(message, type = 'success', container) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type}`;
        alertElement.textContent = message;
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'close';
        closeButton.style.float = 'right';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.fontSize = '1.25rem';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            alertElement.remove();
        };
        
        alertElement.prepend(closeButton);
        
        // Auto-remove after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                alertElement.remove();
            }, 5000);
        }
        
        // Insert at the top of the container
        container.prepend(alertElement);
        
        // Scroll to the alert
        alertElement.scrollIntoView({ behavior: 'smooth' });
    },
    
    /**
     * Shows a loading overlay
     * @param {string} message - Loading message to display
     */
    showLoading: function(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const spinnerIcon = document.createElement('div');
        spinnerIcon.className = 'spinner';
        
        const text = document.createElement('div');
        text.className = 'loading-text';
        text.textContent = message;
        
        spinner.appendChild(spinnerIcon);
        spinner.appendChild(text);
        overlay.appendChild(spinner);
        
        document.body.appendChild(overlay);
    },
    
    /**
     * Hides the loading overlay
     */
    hideLoading: function() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    /**
     * Makes an API request
     * @param {string} url - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - Fetch promise
     */
    fetchAPI: async function(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCsrfToken()
            },
            credentials: 'same-origin'
        };
        
        const fetchOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Request failed with status ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    /**
     * Gets the CSRF token from cookies
     * @returns {string} - CSRF token
     */
    getCsrfToken: function() {
        return document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1] || '';
    },
    
    /**
     * Validates a form
     * @param {HTMLFormElement} form - Form to validate
     * @returns {boolean} - Whether the form is valid
     */
    validateForm: function(form) {
        let isValid = true;
        
        // Clear previous validation messages
        form.querySelectorAll('.validation-message').forEach(el => el.remove());
        
        // Check required fields
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                this.addValidationMessage(field, 'This field is required');
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    /**
     * Adds a validation message to a field
     * @param {HTMLElement} field - Field to add validation message to
     * @param {string} message - Validation message
     */
    addValidationMessage: function(field, message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'validation-message';
        messageElement.style.color = 'var(--danger-color)';
        messageElement.style.fontSize = '0.875rem';
        messageElement.style.marginTop = '0.25rem';
        messageElement.textContent = message;
        
        field.parentNode.appendChild(messageElement);
        field.style.borderColor = 'var(--danger-color)';
    },
    
    /**
     * Formats a date
     * @param {string} dateString - Date string
     * @returns {string} - Formatted date
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// DOM ready function
function onDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Initialize common functionality
onDOMReady(() => {
    // Add active class to current nav item
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});