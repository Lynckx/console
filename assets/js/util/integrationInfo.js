import Http from "../../img/channels/http-channel.svg";
import HttpDark from "../../img/channels/http-dark.png";
import Mqtt from "../../img/channels/mqtt-channel.svg";
import MqttDark from "../../img/channels/mqtt-dark.png";

// Community integration images
import Aws from "../../img/channels/community/aws-channel.svg";
import AwsDark from "../../img/channels/community/flows/aws-dark.png";
import Azure from "../../img/channels/community/azure-channel.svg";
import AzureDark from "../../img/channels/community/flows/azure-dark.svg";
import AzureIntro from "../../img/channels/community/intro_screens/azure.png";
import IotCentral from "../../img/channels/community/iot-central-channel.svg";
import IotCentralDark from "../../img/channels/community/flows/iot-central-dark.svg";
import Adafruit from "../../img/channels/community/adafruit.png";
import AdafruitDark from "../../img/channels/community/flows/adafruit-dark.png";
import Akenza from "../../img/channels/community/akenza.png";
import AkenzaDark from "../../img/channels/community/flows/akenza-dark.png";
import Cargo from "../../img/channels/community/cargo.svg";
import CargoDark from "../../img/channels/community/flows/cargo-dark.png";
import Datacake from "../../img/channels/community/datacake.png";
import DatacakeDark from "../../img/channels/community/flows/datacake-dark.png";
import DatacakeIntro from "../../img/channels/community/intro_screens/datacake.png";
import GoogleSheet from "../../img/channels/community/google-sheet.svg";
import GoogleSheetDark from "../../img/channels/community/flows/google-sheet-dark.svg";
import Microshare from "../../img/channels/community/microshare.png";
import MicroshareDark from "../../img/channels/community/flows/microshare-dark.png";
import MyDevices from "../../img/channels/community/mydevices.svg";
import MyDevicesDark from "../../img/channels/community/flows/mydevices-dark.png";
import Tago from "../../img/channels/community/tago.png";
import TagoDark from "../../img/channels/community/flows/tago-dark.png";
import Ubidots from "../../img/channels/community/ubidots.png";
import UbidotsDark from "../../img/channels/community/flows/ubidots-dark.png";
import UbidotsIntro from "../../img/channels/community/intro_screens/ubidots.png";
import Blockbax from "../../img/channels/community/blockbax.png"
import BlockbaxDark from "../../img/channels/community/flows/blockbax-dark.png"
import BlockbaxIntro from "../../img/channels/community/intro_screens/blockbax.png"

export const integrationImgMap = {
  blockbax: BlockbaxDark,
  adafruit: AdafruitDark,
  aws: AwsDark,
  azure: AzureDark,
  iot_central: IotCentralDark,
  cargo: CargoDark,
  my_devices: MyDevicesDark,
  datacake: DatacakeDark,
  http: HttpDark,
  mqtt: MqttDark,
  tago: TagoDark,
  ubidots: UbidotsDark,
  google_sheets: GoogleSheetDark,
  microshare: MicroshareDark,
  akenza: AkenzaDark,
};

export const http_integrations = ["http", "blockbax", "cargo", "my_devices", "akenza", "datacake", "microshare", "tago", "ubidots", "google_sheets"]
export const mqtt_integrations = ["mqtt", "adafruit"]

export const getAllowedIntegrations = () => {
  const convertToList = (str) => {
    return str.replaceAll(" ", "").replace(/(^,+)|(,+$)/g, '').split(',').reduce((acc, curr) => {
      acc[curr] = true
      return acc
    }, {})
  }

  if (window.allowed_integrations && window.allowed_integrations !== "all") {
    return convertToList(window.allowed_integrations)
  }
  if (process.env.ALLOWED_INTEGRATIONS && process.env.ALLOWED_INTEGRATIONS !== "all") {
    return convertToList(process.env.ALLOWED_INTEGRATIONS)
  }
  return [...CORE_INTEGRATION_TYPES, ...COMMUNITY_INTEGRATION_TYPES].reduce((acc, i) => {
    acc[i.type] = true
    return acc
  }, {})
}

export const CORE_INTEGRATION_TYPES = [
  {
    name: "HTTP",
    type: "http",
    img: `${Http}`,
    info: {
      title: "Custom HTTP Integration",
      desc: "This integration allows for sending data to an endpoint, as well as receiving data, over HTTP.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/http/",
    }
  },
  {
    name: "MQTT",
    type: "mqtt",
    img: `${Mqtt}`,
    info: {
      title: "Custom MQTT Integration",
      desc: "This Integration allows for sending data to an endpoint, as well as receiving data, over the MQTT protocol.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/mqtt",
    }
  },
];

export const COMMUNITY_INTEGRATION_TYPES = [
  {
  name: "Blockbax",
  type: "blockbax",
  img: `${Blockbax}`,
  info: {
      title: "Blockbax Low-Code IoT Platform",
      desc: "Join the future of smart operations, automate your business through sensor and machine data without coding.",
      docLink: "https://blockbax.com/docs/integrations/helium/",
      externalLink: "https://blockbax.com/"
  },
  introImg: `${BlockbaxIntro}`
  },
  {
    name: "Helium Cargo",
    type: "cargo",
    img: `${Cargo}`,
    info: {
      title: "Helium Cargo",
      desc: "Cargo is an in-house mapping tool used at Helium.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/cargo/",
      externalLink: "https://cargo.helium.com/"
    }
  },
  {
    name: "myDevices Cayenne",
    type: "my_devices",
    img: `${MyDevices}`,
    info: {
      title: "The world's first drag-and-drop IoT project builder",
      desc: "Cayenne from myDevices, is a free, drag and drop IoT project builder, that empowers developers, designers and engineers to quickly prototype and share their connected device projects.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/mydevices-cayenne/",
      externalLink: "https://developers.mydevices.com/cayenne/features/"
    }
  },
  {
    name: "AWS IoT Core",
    type: "aws",
    img: `${Aws}`,
    info: {
      title: "Easily and securely connect devices to the cloud",
      desc: "AWS IoT Core lets you connect billions of IoT devices and route trillions of messages to AWS services without managing infrastructure.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/aws-iot-core/",
      externalLink: "https://aws.amazon.com/iot-core/"
    }
  },
  {
    name: "Azure IoT Hub",
    type: "azure",
    img: `${Azure}`,
    info: {
      title: "Build your IoT application with two-way communication",
      desc: "Microsoft Azure IoT Hub enables highly secure and reliable communication between your Internet of Things (IoT) application and the devices it manages.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/azure/",
      externalLink: "https://azure.microsoft.com/en-us/services/iot-hub/#overview"
    },
    introImg: `${AzureIntro}`
  },
  {
    name: "Azure IoT Central",
    type: "iot_central",
    img: `${IotCentral}`,
    info: {
      title: "Go from proof of concept to proof of value",
      desc: "Azure IoT Central is highly secure, scales with your business as it grows, ensures your investments are repeatable, and integrates with your existing business apps",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/azure/#on-azure-iot-central",
      externalLink: "https://azure.microsoft.com/en-us/services/iot-central/#overview"
    }
  },
  {
    name: "Adafruit IO",
    type: "adafruit",
    img: `${Adafruit}`,
    info: {
      title: "The easiest way to stream, log, and interact with your data.",
      desc: "Adafruit IO is a powerful but simple to use Internet of Things platform from Adafruit.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/adafruitio/",
      externalLink: "https://io.adafruit.com/"
    }
  },
  {
    name: "Akenza",
    type: "akenza",
    img: `${Akenza}`,
    info: {
      title: "The IoT platform at the heart of your smart solution",
      desc: "Akenza is the IoT application enablement platform, allowing you to build great IoT products and services with value.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/akenza/",
      externalLink: "https://docs.akenza.io/"
    }
  },
  {
    name: "Datacake",
    type: "datacake",
    img: `${Datacake}`,
    info: {
      title: "Making IoT accessible to Everyone",
      desc: "Datacake is a multi-purpose, low-code IoT platform that requires no programming skills and minimal time to create custom IoT applications.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/datacake/",
      externalLink: "https://docs.datacake.de/"
    },
    introImg: `${DatacakeIntro}`
  },
  {
    name: "Google Sheets",
    type: "google_sheets",
    img: `${GoogleSheet}`,
    info: {
      title: "Make data-driven decisions, in Google Sheets",
      desc: "Create and collaborate on online spreadsheets in real-time and from any device.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/google-sheets/",
      externalLink: "https://www.google.com/sheets/about/"
    }
  },
  {
    name: "Microshare",
    type: "microshare",
    img: `${Microshare}`,
    info: {
      title: "EverSmart is the natural evolution of Microshare’s IoT data solutions for the world of business.",
      desc: "Microshare is a data leverage platform for the IoT era, providing a solution to sharing, privacy, security, audit, confidentiality, data monetization and cost savings",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/microshare/",
      externalLink: "https://docs.microshare.io/docs/2/"
    }
  },
  {
    name: "TagoIO",
    type: "tago",
    img: `${Tago}`,
    info: {
      title: "Easily Create Your Own IoT Solutions",
      desc: "Tago.IO combines advanced device management, services, data storage, visualization, and analytics with an easy to implement cloud-based IoT platform.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/tago/",
      externalLink: "https://tago.io/developers/"
    }
  },
  {
    name: "Ubidots",
    type: "ubidots",
    img: `${Ubidots}`,
    info: {
      title: "Rapidly assemble and launch Internet of Things (IoT) applications without having to write code or hire a software development team.",
      desc: "Ubidots allows you to rapidly assemble and launch Internet of Things (IoT) applications without having to write code or hire a software development team.",
      docLink: "https://docs.helium.com/use-the-network/console/integrations/ubidots/",
      externalLink: "https://ubidots.com/docs/"
    },
    introImg: `${UbidotsIntro}`
  },
];
