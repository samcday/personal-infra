Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2004"

  config.vm.define "chonk", primary: true do |node|
    node.vm.network "private_network", ip: "192.168.50.4"
    node.vm.provider :libvirt do |libvirt|
      libvirt.cpus = 4
      libvirt.memory = 4096
    end
  end

  config.vm.provision :ansible do |ansible|
    ansible.playbook = "playbook.yml"
    # kubespray expects become: true set at global level.
    ansible.become = true
    # kubespray executes some tasks against localhost, for example to conveniently barf kubectl+config into inventory/artifacts dir on host.
    ansible.limit = "all,localhost"

    ansible.groups = {
      "kube-master" => ["chonk"],
      "kube-node" => ["chonk"],
      "etcd" => ["chonk"],
      "k8s-cluster:children" => ["kube-node", "kube-master"],
      "all:vars" => {
        # These two lines enable local path storage provisioner for "persistent" volumes.
        "local_path_provisioner_enabled" => "True",
        "local_path_provisioner_claim_root" => "/var/lib/k8s-local-path-provisioner",
        # These two lines make kubespray copy the provisioner + config onto the host.
        "kubeconfig_localhost" => "True",
        "kubectl_localhost" => "True",
      }
    }
  end
end
