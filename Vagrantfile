Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2004"

  config.vm.define "chonk", primary: true do |node|
  end

  # config.vm.provision :shell, inline: "echo 'Defaults: vagrant !requiretty' >> /etc/sudoers.d/vagrant-notty"
  config.vm.provision :ansible do |ansible|
    ansible.playbook = "playbook.yml"
  end
end
