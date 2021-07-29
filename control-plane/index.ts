import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";

const cfg = new pulumi.Config();
const hcloudCfg = new pulumi.Config("hcloud");

const network = new hcloud.Network("cluster", {
  name: "cluster",
  ipRange: "10.0.0.0/8",
});

const networkId = network.id.apply(id => parseInt(id, 10));

const controlPlaneSubnet = new hcloud.NetworkSubnet("control-plane", {
  networkId: networkId,
  networkZone: "eu-central",
  ipRange: "10.0.0.0/24",
  type: "cloud",
}, {dependsOn: network});

const firewall = new hcloud.Firewall("firewall", {
  name: "firewall",
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

const nodeOpts = [
  // Taint control nodes to prevent regular workloads running on them.
  "--node-taint CriticalAddonsOnly=true:NoExecute",

  // We'll be using hcloud-cloud-controller-manager.
  "--disable-cloud-controller",
  "--kubelet-arg cloud-provider=external",

  // Without this, flannel tries to direct traffic over the public interface, which dies at the firewall.
  // It's also very bad because VXLAN traffic ain't encrypted dawg.
  // enp7s0 is the interface that Debian brings up for the private network on AMD cpx11 instances.
  // Intel instances use something different. Of course. "ens10"
  "--flannel-iface enp7s0",

  // This is the default CIDR for Hetzner CCCM.
  "--cluster-cidr=10.244.0.0/16",
].join(" ");

// First control node is special. All other control nodes + worker nodes are hardcoded to bootstrap into the cluster
// via this node's fixed private IP: 10.0.0.2
const controlNode1 = new hcloud.Server("control1", {
  name: "control1",
  image: "debian-10",
  serverType: "cpx11",
  location: "nbg1",
  sshKeys: ["key"],
  networks: [
    {
      ip: "10.0.0.2",
      networkId,
    }
  ],
  firewallIds: [firewall.id.apply(id => parseInt(id, 10))],
  userData: pulumi.all([
    cfg.requireSecret("k3s_token"), hcloudCfg.requireSecret("token")]).apply(([k3sToken, hcloudToken]) => `
#!/bin/bash
apt update
apt install -y apparmor apparmor-utils curl
curl -sfL https://get.k3s.io | K3S_TOKEN="${k3sToken}" sh -s - --cluster-init ${nodeOpts} --disable servicelb \
                                                               --disable traefik
kubectl -n kube-system create --dry-run=client secret generic hcloud --from-literal=token=${hcloudToken} \
        --from-literal=network=cluster -o yaml > /var/lib/rancher/k3s/server/manifests/hcloud-secret.yaml
curl -L https://github.com/hetznercloud/hcloud-cloud-controller-manager/releases/latest/download/ccm-networks.yaml \
     -o /var/lib/rancher/k3s/server/manifests/hccm.yaml
  `.trim()),
}, {
  dependsOn: [firewall, controlPlaneSubnet],
});

export const controlNode1PublicIP = controlNode1.ipv4Address;
