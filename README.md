# PortaNexus

## A mobile connection for your Portainer instance

View, control and manage your portainer instance from your smartphone (Android support only for now).

Login with your Portainer Instance URL and your API Key, [check Portainer documentation on how to generate an API Key for your instance](https://docs.portainer.io/api/access).

## Screens Showcase

### Login Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/login_light.png?raw=true)  |  ![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/login_dark.png?raw=true)


### Endpoints Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/endpoints_light.png?raw=true)  |  ![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/endpoints_dark.png?raw=true)

### Home Screen (Stacks)

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/stacks_light.png?raw=true)  |  ![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/stacks_dark.png?raw=true)

### Home Screen (Stacks expanded)

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/stacks_expanded_light.png?raw=true)  |  ![](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/stacks_expanded_dark.png?raw=true)


## Planned Roadmap

### Roadmap from 0.1.0 to 1.0.0

![roadmap](https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/roadmap.png?raw=true)

More details below.



#### **Version 0.2.0**
**Goals:** Enhance user experience and basic functionalities.
- **User Feedback Mechanism:** Implement a simple feedback form for users to submit issues or feature requests.
- **Container Management:** 
  - Add the ability to view container logs.
  - Provide a detailed view of container information (e.g., resource usage, restart policies).

#### **Version 0.3.0**
**Goals:** Expand management capabilities.
- **Stack Management:**
  - Add functionalities to create and delete stacks.
  - Enable editing existing stack configurations.
- **Notifications:**
  - Implement push notifications for container and stack status changes.
- **Search Functionality:**
  - Add search functionality for containers and stacks.

#### **Version 0.4.0**
**Goals:** Improve usability and support for other Docker types.
- **Support for Docker Swarm:** 
  - Extend support to Docker Swarm instances (type === 2).
- **Multi-language Support:** 
  - Introduce localization to support multiple languages.
- **Settings Page:**
  - Allow users to configure preferences (e.g., notification settings, API key management).

#### **Version 0.5.0**
**Goals:** Enhance analytics and monitoring features.
- **Container Metrics Dashboard:**
  - Visualize key metrics (CPU, memory usage) for containers in a dashboard format.
- **Improved Reporting:** 
  - Enhance reporting capabilities with better popups and alerts.

#### **Version 0.6.0**
**Goals:** Increase application performance and reliability.
- **Performance Optimization:**
  - Optimize API calls and data fetching mechanisms to reduce loading times.
- **Caching Mechanism:**
  - Implement caching for frequently accessed data (e.g., container statuses).
- **Offline Support:**
  - Basic offline functionality allowing users to view cached data when disconnected.

#### **Version 0.7.0**
**Goals:** Enhance UI and user engagement.
- **Customizable UI Themes:**
  - Allow users to choose or customize themes beyond light and dark mode.
- **User Profiles:**
  - Enable user profile management (e.g., saving favorite stacks, previous sessions).
- **Integrate Help/Documentation:**
  - Include a help section or link to documentation on how to use the app effectively.

#### **Version 0.8.0**
**Goals:** Expand support for advanced features and integrations.
- **Webhook Integration:**
  - Allow users to set up webhooks for certain actions (e.g., stack deployment automation webhook).
- **Additional Docker Features:**
  - Add support for volume management and network management.

#### **Version 0.9.0**
**Goals:** Prepare for final release and polish features.
- **Comprehensive Testing:**
  - Perform thorough testing, including unit tests and user acceptance testing (UAT).
- **Final UI Polish:**
  - Make final UI adjustments based on user feedback and testing results.

#### **Version 1.0.0**
**Goals:** Officially launch the app with robust features.
- **Final Release Preparation:**
  - Fix any remaining bugs and polish the final version.
- **Documentation:**
  - Provide detailed documentation for users and developers (e.g., README, API documentation).