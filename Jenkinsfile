#!/usr/bin/env groovy
pipeline {
    agent { label 'docker' }
    stages {
        stage('build') {
            when { branch 'main' }
            steps {
                checkout scm
                script {
                    head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                    sh """
                        docker build -t annorep:${head_hash} -f Dockerfile .
                    """
                }   
            }
        }

        stage('push') {
            when { branch 'main' }
            steps {
                checkout scm
                script {
                    head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                    sh """
                        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 164919093702.dkr.ecr.us-east-1.amazonaws.com
                        docker tag annorep:${head_hash} 164919093702.dkr.ecr.us-east-1.amazonaws.com/annorep:${head_hash}
                        docker push 164919093702.dkr.ecr.us-east-1.amazonaws.com/annorep:${head_hash}
                    """
                }   
            }
        }

        stage('deploy') {
            when { branch 'main' }
            steps {
                checkout scm
                script {
                    head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                    sh """
                        ssh qdradmin@qdr-stage 'sudo su - annorep -c \"DEPLOY_TAG=${head_hash} /srv/annorep/deploy\"'
                    """
                }   
            }
        }        
    }
}
