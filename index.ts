import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";

const network = new hcloud.Network("infra", {
  ipRange: "10.0.0.0/24",
});

const subnet = new hcloud.NetworkSubnet("infra", {
  networkId: network.id.apply(id => parseInt(id, 10)),
  networkZone: "eu-central",
  ipRange: "10.0.0.0/24",
  type: "cloud",
});
