import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";

const cfg = new pulumi.Config();

const network = new hcloud.Network("infra", {
  ipRange: "10.0.0.0/24",
});

const networkId = network.id.apply(id => parseInt(id, 10));

const subnet = new hcloud.NetworkSubnet("infra", {
  networkId: networkId,
  networkZone: "eu-central",
  ipRange: "10.0.0.0/24",
  type: "cloud",
});

const sshKey = new hcloud.SshKey("personal", {
  publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFwawprQXEkGl38Q7T0PNseL0vpoyr4TbATMkEaZJTWQ",
});

const firewall = new hcloud.Firewall("infra", {
  rules: [22, 6443].map(port => ({
    direction: "in",
    protocol: "tcp",
    port: String(port),
    sourceIps: [
      "0.0.0.0/0",
      "::/0",
    ],
  })),
});

const controlNode1 = new hcloud.Server("control1", {
  image: "debian-10",
  serverType: "cpx11",
  location: "nbg1",
  sshKeys: [sshKey.id],
  networks: [
    {
      ip: "10.0.0.2",
      networkId,
    }
  ],
  firewallIds: [firewall.id.apply(id => parseInt(id, 10))],
  userData: cfg.requireSecret("k3s_token").apply(k3s_token => `#!/bin/bash
apt update
apt install -y apparmor apparmor-utils
curl -sfL https://get.k3s.io | K3S_TOKEN="${k3s_token}" sh -s - --cluster-init
  `),
});
