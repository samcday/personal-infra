# control-plane

Pulumi configuration to initialize a Kubernetes control plane in Hetzner Cloud.

Handles provisioning network, subnets, firewall, and servers to bring up a new cluster.

## Bootstrap

 * `npm install`
 * Create a new Hetzner Cloud project.
 * Generate a Read/Write token for the new project.
 * Update Pulumi config with token: `pulumi config -s main set hcloud:token <key> --secret`
 * Upload SSH key and name it "key".
 * Generate and save K3s node bootstrap token: `pulumi config -s main set k3s_token $(head -n10000 /dev/random | sha256sum | cut -d' ' -f1) --secret`
 * Place the k3s token in the cloud-init data for the cluster-autoscaler.
 * `pulumi up -f -s main`
 * Wait a little while for the initial control plane node to come up (30-60sec).
 * Pull the kubeconfig down: `IP=$(pulumi stack -s main output controlNode1PublicIP); mkdir -p ~/.kube && scp root@$IP:/etc/rancher/k3s/k3s.yaml ~/.kube/config && sed -i -e s/127.0.0.1/$IP/ ~/.kube/config`
 * Bootstrap Flux: `flux bootstrap github --owner=samcday --repository=personal-infra --path=cluster --personal --toleration-keys=CriticalAddonsOnly`
