# control-plane

Pulumi configuration to initialize a Kubernetes control plane in Hetzner Cloud.

Handles provisioning network, subnets, firewall, and servers to bring up a new cluster.

## Bootstrap

 * `npm install`
 * Create a new Hetzner Cloud project.
 * Generate a Read/Write token for the new project.
 * Update Pulumi config with token: `pulumi config set hcloud:token <key> --secret`
 * Upload SSH key and name it "key".
 * Generate a random token to use for K3s node bootstrapping: `head -n10000 /dev/random | sha256sum | cut -d' ' -f1 > token`. Save the token securely for later use (it's needed by cluster-autoscaler)
 * Add the cluster token to Pulumi config: `pulumi config set k3s_token $(<token) --secret && rm token`
 * `pulumi up`
