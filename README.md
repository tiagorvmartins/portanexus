# PortaNexus ![Android APK Workflow](https://github.com/tiagorvmartins/portanexus/actions/workflows/android.release.apk.yml/badge.svg) [![Download APK v0.2.0](https://img.shields.io/badge/download-v0.2.0-green)](https://github.com/tiagorvmartins/portanexus/releases/download/v0.2.0/portanexus-v0.2.0.apk)

<img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/demo/demo.gif" width="35%" height="35%"/>

## A mobile connection for your Portainer instance

View, control and manage your portainer instance from your smartphone (Android support only for now).

Login with your Portainer Instance URL and your API Key, [check Portainer documentation on how to generate an API Key for your instance](https://docs.portainer.io/api/access).

For the Portainer Instance URL be sure to add the route /api

Example of Portainer Instance URL: https://example.tld/api

## Android

Support currently through apk file that can be downloaded from the github releases page of this repository.

## iOS

The support for iOS is only through PWA at the moment.

## Progressive Web App (PWA) Installation and Usage using Docker


There is a Dockerfile which you can use to build the portanexus application.

For convenience there is also a Docker image being maintained on docker hub [tiagorvmartins/portanexus](https://hub.docker.com/r/tiagorvmartins/portanexus-web)

**Compose**
```
services:
  portanexus:
    image: tiagorvmartins/portanexus-web:v0.2.0
    ports:
      - "8080:80  # You can change the binded port on host to your needs if needed
```

**Reverse Proxy configuration to expose PortaNexus (sample using caddy)**
```
portanexus.your-domain.ltd {
  reverse_proxy http://127.0.0.1:8080  # or the port that you changed to
}
```



### Portainer Extra Configuration for CORS
There is an extra configuration to be done on **Portainer to allow CORS request** from the browser

```
portainer.your-domain.ltd {
  
  // ...
  // your extra configurations
  // ...

  @cors {
    method GET POST
  }

  header @cors Access-Control-Allow-Origin "*"

  # Handle OPTIONS requests
  @options {
    method OPTIONS
  }

  header @options Access-Control-Allow-Origin "*"
  header @options Access-Control-Allow-Headers "Authorization, Origin, X-Requested-With, Content-Type, Accept, X-Api-Key"
  header @options Access-Control-Allow-Methods "GET, POST, OPTIONS"
  respond @options "" 200
}
```



## Screens Showcase (v0.1.4)

### Login Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/login_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/login_dark.png" width="270" height="600"> |

### Drawer Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/drawer_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/drawer_dark.png" width="270" height="600"> |

### Endpoints Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/endpoints_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/endpoints_dark.png" width="270" height="600"> |

### Containers Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/containers_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/containers_dark.png" width="270" height="600"> |

### Stacks Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/stacks_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/stacks_dark.png" width="270" height="600"> |

### Container Logs Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/logs_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/logs_dark.png" width="270" height="600"> |

### Settings Screen

Light Theme                |  Dark Theme
:-------------------------:|:-------------------------:
| <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/settings_light.png" width="270" height="600"> | <img src="https://github.com/tiagorvmartins/portanexus/blob/main/docs/images/settings_dark.png" width="270" height="600"> |


## Planned Roadmap

[Roadmap](https://github.com/tiagorvmartins/portanexus/blob/main/ROADMAP.md)

<p align="center">
  <a href="https://www.buymeacoffee.com/tiagorvmartins" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>
