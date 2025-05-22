# Access Control System - Architecture Overview

## Overview
This is a Django-based access control system designed to manage organizations, user access, and UI component configurations. The system allows for hierarchical organization structures, custom UI component visibility and naming per organization, and user management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a traditional Django MVC (Model-View-Template) architecture with:

- **Backend**: Django 5.2.1 serving as the core application framework
- **Frontend**: HTML templates with vanilla JavaScript for dynamic content
- **Database**: SQLite for development (can be migrated to PostgreSQL for production)
- **Authentication**: Django's built-in authentication system

The frontend is built using a mix of server-rendered templates and client-side JavaScript for enhanced interactivity. API endpoints are used for AJAX operations to create a more responsive user experience.

## Key Components

### 1. Organizations
Organizations are the primary entity in the system. They can be hierarchical (have parent organizations) and contain members. Each organization can have customized page configurations.

Key files:
- `templates/organizations/create.html`
- `templates/organizations/detail.html`
- `static/js/organization.js`

### 2. Page Configurations
Page configurations define UI components that can be customized per organization. This allows different organizations to have different views of the same interface.

Key files:
- `templates/page_configs/list.html`
- `static/js/page_config.js`

### 3. Mapping System
The mapping system connects organizations to page configurations, allowing customization of UI components for each organization.

Key files:
- `templates/mapping/map_pages.html`
- `static/js/mapping.js`

### 4. User Management
User management functionality is planned but not yet implemented in the current codebase.

## Data Flow

1. **User Authentication**:
   - Users log in through Django's authentication system
   - Authentication state determines available actions

2. **Organization Management**:
   - Users can create and manage organizations
   - Organizations can be arranged hierarchically
   - Users can be assigned as members to organizations

3. **Page Configuration**:
   - Administrators define page configurations
   - Configurations can be uploaded in bulk or added individually

4. **Organization-Page Mapping**:
   - For each organization, administrators can customize how page configurations appear
   - Customizations include renaming and hiding UI components

## External Dependencies

- **Django 5.2.1**: The core web framework
- **Feather Icons**: Used for UI icons via CDN
- **Custom CSS**: For styling the application interface

## Deployment Strategy

The current deployment configuration is set up for Replit:
- Uses Python 3.11
- Runs the Django development server on port 5000
- Automatically installs Django and creates the project if not present

For a production environment, consider:
1. Using a production-ready web server (Gunicorn, uWSGI)
2. Setting up a reverse proxy (Nginx, Apache)
3. Migrating to PostgreSQL for better scalability
4. Implementing proper static file serving
5. Setting `DEBUG = False` and configuring appropriate security settings

## Database Schema (To Be Implemented)

Based on the frontend templates and JavaScript files, the following models will need to be created:

1. **Organization**:
   - name, description, parent_organization (self-reference), created_at

2. **User**:
   - Extend Django's User model or create a profile model

3. **OrganizationMember**:
   - organization, user, role

4. **PageConfiguration**:
   - page_id, component_id, default_name, default_visible, order

5. **OrganizationPageMapping**:
   - organization, page_configuration, custom_name, is_visible