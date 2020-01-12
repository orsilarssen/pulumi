"use strict";

const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

let size = "t2.micro";     // t2.micro is available in the AWS free tier
let ami = aws.getAmi({
    filters: [{
      name: "name",
      values: ["amzn-ami-hvm-*"],
    }],
    owners: ["137112412989"], // This owner ID is Amazon
    mostRecent: true,
});

let group = new aws.ec2.SecurityGroup("orsipulumisecgroup", {
  ingress: [
      { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
      { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
      { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
      { protocol: "tcp", fromPort: 30, toPort: 30, cidrBlocks: ["0.0.0.0/0"] },
      { protocol: "tcp", fromPort: 3000, toPort: 3000, cidrBlocks: ["0.0.0.0/0"] },
  ],

  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

let userData = // <-- ADD THIS DEFINITION
`#!/bin/bash
apt install -yy git curl
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu
docker run -d -p 80:3000 orsilarssen/helloworld`;

let server = new aws.ec2.Instance("orsiprod", {
    instanceType: size,
    securityGroups: [ group.name ], // reference the security group resource above
    ami: ami.id,
    userData: userData,
});

let server2 = new aws.ec2.Instance("orsidev", {
  instanceType: size,
  securityGroups: [ group.name ], // reference the security group resource above
  ami: ami.id,
  userData: userData,
});

let server3 = new aws.ec2.Instance("orsitest", {
  instanceType: size,
  securityGroups: [ group.name ], // reference the security group resource above
  ami: ami.id,
  userData: userData,
});

/*let serverNames = ["orsidev", "orsitest", "orsiprod"];
let serverArray = [];

for (let i = 0; i < serverNames.length; i++) {
    serverArray[i] = new aws.ec2.Instance(serverNames[i], {
        instanceType: size,
        securityGroups: [group.name], // reference the security group resource above
        ami: ami.id,
        userData: userData,
    });
};*/

exports.publicIp = server.publicIp;
exports.publicHostName = server.publicDns;

//exports.bucketName = bucket.id;

