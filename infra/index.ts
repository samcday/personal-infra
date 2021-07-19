import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";
import * as kubernetes from "@pulumi/kubernetes";
import * as provisioners from "./provisioners";

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
  publicKey: cfg.requireSecret("ssh_key_pub"),
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

const controlConn: provisioners.ConnectionArgs = {
  host: controlNode1.ipv4Address,
  username: "root",
  privateKey: cfg.requireSecret("ssh_key"),
};

const kubeconfig = new provisioners.RemoteExec("kube-config", {
  changeToken: "kubeconfig",
  conn: controlConn,
  command: "while [[ ! -f /etc/rancher/k3s/k3s.yaml ]]; do sleep 1; done; cat /etc/rancher/k3s/k3s.yaml",
}, { dependsOn: controlNode1 });


// const k8s = new kubernetes.Provider("kube", {
//   kubeconfig: kubeconfig.result.stdout,
// });

// const appLabels = { app: "nginx" };
// const deployment = new kubernetes.apps.v1.Deployment("nginx", {
//     spec: {
//         selector: { matchLabels: appLabels },
//         replicas: 1,
//         template: {
//             metadata: { labels: appLabels },
//             spec: { containers: [{ name: "nginx", image: "nginx" }] }
//         }
//     }
// });
// export const name = deployment.metadata.name;
