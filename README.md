# personal-infra

All the garbage infrastructure code to get my personal kube cluster and other stuff running.

## Quickstart

 * `pacman -S vagrant libvirt ebtables dnsmasq bridge-utils openbsd-netcat` 
 * `vagrant plugin install vagrant-libvirt`
 * `vagrant up --provider=libvirt`
 * `alias kubectl="$(pwd)/.vagrant/provisioners/ansible/inventory/artifacts/kubectl.sh"`

### Kubernetes Dashboard

 * Grab a token for the admin-user: `kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')`
 * Start a `kubectl proxy`
 * Visit [http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/](http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/) in your browser.

### Grafana

 * `kubectl --namespace monitoring port-forward svc/grafana 3000`
 * Visit [http://localhost:3000/](http://localhost:3000/) in your browser.

### Deploy

`ansible-playbook -i inventory.ini playbook.yml -b -v`

### Changing kube-prometheus

 * `alias jb="docker run --rm -v $(pwd):$(pwd) --workdir $(pwd) quay.io/coreos/jsonnet-ci jb"`
 * Update kube-prometheus Jsonnet library: `jb update`
 * Do things to `kube-prometheus.jsonnet`
 * Run `docker run --rm -v $(pwd):$(pwd) --workdir $(pwd) quay.io/coreos/jsonnet-ci ./kube-prometheus-build.sh`
 * Update manifests: `jb ./build.sh`
 kubectl apply -f kube-prometheus-manifests/setup
 until kubectl get servicemonitors --all-namespaces ; do date; sleep 1; echo ""; done
 kubectl apply -f kube-prometheus-manifests
 ```

### postgres-operator

 * Managed via the Helm chart in `charts/crunchy-postgres-operator`
 * Initial installation needs pgo_admin_password injected: `helm install postgres-operator -n pgo charts/crunchy-postgres-operator --set pgo_admin_password=poopie`
