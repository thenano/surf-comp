# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "boxcutter/centos72"
  config.vm.network :forwarded_port, host_ip: "127.0.0.1", guest: 3000, host: 3000
  config.vm.synced_folder ".", "/app", type: "rsync"

  if Vagrant.has_plugin?("vagrant-cachier")
    config.cache.scope = :box
  end

  config.vm.provision "shell", inline: <<-SHELL
    sudo yum update
    curl -fsSL https://get.docker.com/ | sh
    sudo usermod -aG docker vagrant

    sudo yum install -y wget make git libxml2-devel epel-release
    sudo yum install -y nodejs
    sudo yum install -y https://github.com/feedforce/ruby-rpm/releases/download/2.3.0/ruby-2.3.0-1.el7.centos.x86_64.rpm
    sudo gem install bundler
  SHELL

  config.vm.provision "shell", inline: <<-SHELL
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo systemctl disable firewalld
    docker run --name database -p 27017:27017 -d mongo
  SHELL
end
