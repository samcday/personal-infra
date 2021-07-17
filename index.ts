import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";

const network = new hcloud.Network("infra", {
  ipRange: "10.0.0.0/24",
});
