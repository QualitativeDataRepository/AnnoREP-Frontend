#!/usr/bin/env groovy
pipeline {
    agent { label 'docker' }
    stages {
        stage('build (stage)') {
            when { branch 'stage' }
            steps {
                slackMessage("Building..", "good")
                checkout scm
                script {
                    try {
                        head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                        sh """
                            docker build --build-arg MATOMO_SITE_ID=10 -t annorep:${head_hash} -f Dockerfile .
                        """
                    } catch (Exception e) {
                        slackMessage(e.toString(), "danger")
                    }
                } 
            }
        }
        stage('build (main)') {
            when { branch 'main' }
            steps {
                slackMessage("Building..", "good")
                checkout scm
                script {
                    try {
                        head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                        sh """
                            docker build --build-arg MATOMO_SITE_ID=4 -t annorep:${head_hash} -f Dockerfile .
                        """
                    } catch (Exception e) {
                        slackMessage(e.toString(), "danger")
                    }
                }
            }
        }
        stage('push') {
            when { anyOf { branch 'stage'; branch 'main' } }
            steps {
                slackMessage("Pushing..", "good")
                checkout scm
                withCredentials([
                    string(credentialsId: 'AWS_REGION', variable: 'AWS_REGION'),
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID'),
                    string(credentialsId: 'ANNOREP_ECR_NAME', variable: 'ANNOREP_ECR_NAME'),
                    string(credentialsId: 'ANNOREP_DEPLOY_USER', variable: 'ANNOREP_DEPLOY_USER'),
                    ]) {
                        script {
                            try {
                                head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                                sh """
                                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                                    docker tag annorep:${head_hash} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ANNOREP_ECR_NAME}:${head_hash}
                                    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ANNOREP_ECR_NAME}:${head_hash}
                                """
                            } catch (Exception e) {
                                slackMessage(e.toString(), "danger")
                            }
                        }
                    }
            }
        }
        stage('deploy (stage)') {
            when { branch 'stage' }
            steps {
                slackMessage("Deploying..", "good")
                checkout scm
                withCredentials([
                    string(credentialsId: 'ANNOREP_DEPLOY_USER', variable: 'ANNOREP_DEPLOY_USER'),
                    string(credentialsId: 'QDR_STAGE', variable: 'QDR_STAGE'),
                    ]) {
                    script {
                        try {
                            head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                            sh """
                                ssh ${ANNOREP_DEPLOY_USER}@${QDR_STAGE} annorep-deploy ${head_hash}
                            """
                        } catch (Exception e) {
                            slackMessage(e.toString(), "danger")
                        }
                    }
                }
            }
        }
        stage('deploy (main)') {
            when { branch 'main' }
            steps {
                slackMessage("Deploying..", "good")
                checkout scm
                withCredentials([
                    string(credentialsId: 'ANNOREP_DEPLOY_USER', variable: 'ANNOREP_DEPLOY_USER'),
                    string(credentialsId: 'QDR_PROD', variable: 'QDR_PROD'),
                    ]) {
                    script {
                        try {
                            head_hash = sh(script:"git rev-parse HEAD | head -c 8", returnStdout:true).trim()
                            sh """
                                ssh ${ANNOREP_DEPLOY_USER}@${QDR_PROD} annorep-deploy ${head_hash}
                            """
                        } catch (Exception e) {
                            slackMessage(e.toString(), "danger")
                        }
                    }
                }
            }
        }
    }
}

@NonCPS
def slackMessage(String message, String color) {
  slackSend message: "<$JOB_URL|$JOB_NAME>: ${message}", color: "${color}"
}
