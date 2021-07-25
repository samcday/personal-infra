import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";

const cfg = new pulumi.Config();

const network = new hcloud.Network("infra", {
  name: "infra",
  ipRange: "10.0.0.0/8",
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

const firewallRules = [22, 6443].map(port => ({
  direction: "in",
  protocol: "tcp",
  port: String(port),
  sourceIps: [
    "0.0.0.0/0",
    "::/0",
  ],
}));

const firewall = new hcloud.Firewall("infra", {
  rules: firewallRules,
});

const controlNodeOpts = [
  // Taint control nodes to keep regular workloads from running on them.
  "--node-taint CriticalAddonsOnly=true:NoExecute",
  // We'll be using hcloud-cloud-controller-manager.
  "--disable-cloud-controller",
].join(" ");

const nodeOpts = [
  // Flannel (or the way k3s is configuring it) is awful, and will try and route traffic over public IP without this option.
  "--flannel-iface enp7s0",
  // We'll be using hcloud-cloud-controller-manager.
  // This option can be/must be removed in Kube 1.23.
  "--kubelet-arg cloud-provider=external",
].join(" ");

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
curl -sfL https://get.k3s.io | K3S_TOKEN="${k3s_token}" sh -s - --cluster-init ${nodeOpts} ${controlNodeOpts}
  `),
}, {
  dependsOn: [network],
});

// for(const num of [2, 3]) {
//   const ip  = "10.0.0." + (1 + num);
//   new hcloud.Server("control" + num, {
//     image: "debian-10",
//     serverType: "cpx11",
//     location: "nbg1",
//     sshKeys: [sshKey.id],
//     networks: [
//       {
//         ip,
//         networkId,
//       }
//     ],
//     firewallIds: [firewall.id.apply(id => parseInt(id, 10))],
//     userData: cfg.requireSecret("k3s_token").apply(k3s_token => `#!/bin/bash
//   apt update
//   apt install -y apparmor apparmor-utils
//   curl -sfL https://get.k3s.io | K3S_TOKEN="${k3s_token}" sh -s - --server https://10.0.0.2:6443 ${nodeOpts} ${controlNodeOpts}
//     `),
//   }, {
//     dependsOn: [controlNode1, network]
//   });
// }

for(const num of [1, 2]) {
  new hcloud.Server("worker" + num, {
    image: "debian-10",
    serverType: "cx21",
    location: "nbg1",
    sshKeys: [sshKey.id],
    networks: [
      {
        networkId,
      }
    ],
    firewallIds: [firewall.id.apply(id => parseInt(id, 10))],
    userData: cfg.requireSecret("k3s_token").apply(k3s_token => `#!/bin/bash
  apt update
  apt install -y apparmor apparmor-utils
  curl -sfL https://get.k3s.io | K3S_TOKEN="${k3s_token}" K3S_URL=https://10.0.0.2:6443 sh -s - ${nodeOpts}
    `),
  }, {
    dependsOn: [controlNode1, network]
  });
}
