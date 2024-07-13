pipeline {
    agent {
        label 'docker' 
    }
    tools {
        maven 'maven'
    }
    environment {
        WORKSPACE_DIR = '/var/lib/jenkins/workspace/adq-java-app'
        PROJECT_ID = 'gcp-adq-pocproject-dev'
        ZONE = 'us-central1-c'
        INSTANCE_NAME = 'get-ubuntudesktop'
        TARGET_HOST_PATH = '/opt/tomcat/apache-tomcat-10.1.26'
        SONARQUBE_PROJECT_KEY = 'adq-java-app'
        SONARQUBE_HOST_URL = 'http://34.69.178.242:9000'
        NEXUS_URL = '34.69.178.242:8081'
        NEXUS_REPOSITORY = 'adq-java-app'
        NEXUS_GROUP_ID = 'in.RAHAM'
        NEXUS_ARTIFACT_ID = 'JAVA_APP'
        NEXUS_VERSION = 'nexus3'
        NEXUS_PROTOCOL = 'http'
        SSH_KEY_PATH = '/var/lib/jenkins/.ssh/id_rsa'
    }
    stages {
        stage('Checkout') {
            steps {
                script {
                    def gitInfo = checkout([$class: 'GitSCM',
                        branches: [[name: "*/${BRANCH_NAME}"]],
                        userRemoteConfigs: [[url: 'https://github.com/SaravanaNani/jenkins-java-project.git']]
                    ])
                    def branchName = gitInfo.GIT_BRANCH.tokenize('/')[1]
                    echo "Branch name: ${branchName}"
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonar_token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                    mvn clean verify sonar:sonar \
                    -Dsonar.projectKey=${SONARQUBE_PROJECT_KEY} \
                    -Dsonar.host.url=${SONARQUBE_HOST_URL} \
                    -Dsonar.login=${SONAR_TOKEN}
                    '''
                }
            }
        }
        
        stage('Package') {
            steps {
                sh '''
                mvn compile
                mvn test
                mvn package
                '''
            }
        }
        stage('Upload Artifact to Nexus') {
            steps {
                script {
                    sh '''
                    cd ${WORKSPACE_DIR}/target/
                    mv JAVA_APP-1.2.*.war JAVA_APP-1.2.${BUILD_NUMBER}
                    '''
                    nexusArtifactUploader artifacts: [[artifactId: "${NEXUS_ARTIFACT_ID}", classifier: '', file: "${WORKSPACE_DIR}/target/JAVA_APP-1.2.${BUILD_NUMBER}", type: 'war']], credentialsId: 'nexus_id', groupId: "${NEXUS_GROUP_ID}", nexusUrl: "${NEXUS_URL}", nexusVersion: "${NEXUS_VERSION}", protocol: "${NEXUS_PROTOCOL}", repository: "${NEXUS_REPOSITORY}", version: "1.2.${BUILD_NUMBER}"
                  }
            }
        }
        stage('Confirmation') {
            steps {
                script {
                    input message: 'Are you sure you want to proceed with the deployment?', ok: 'Yes'
                    def instanceStatus = sh(script: "gcloud compute instances describe ${INSTANCE_NAME} --project=${PROJECT_ID} --zone=${ZONE} --format='get(status)'", returnStdout: true).trim()
                    if (instanceStatus != 'RUNNING') {
                        error "VM instance is not running. Deployment stopped."
                    }
                    env.PRIVATE_IP = sh(script: '''
                        gcloud compute instances list --filter="labels.adq_ubuntudesktop=app" --format="value(networkInterfaces[0].networkIP)" --limit=1
                    ''', returnStdout: true).trim()
                    echo "Private IP: ${env.PRIVATE_IP}"
                }
            }
        }
        stage('Deployment') {
            steps {
                script {
                    // Use Jenkins credentials to authenticate with Nexus
                    withCredentials([usernamePassword(credentialsId: 'nexus_id', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASSWORD')]) {
                        sh '''
                        # Clear the target directory
                        ls -al ${WORKSPACE_DIR}/target/
                        rm -r ${WORKSPACE_DIR}/target/*
                        ls -al ${WORKSPACE_DIR}/target/
                        
                        # Download the artifact from Nexus
                        wget --user=${NEXUS_USER} --password=${NEXUS_PASSWORD} -O ${WORKSPACE_DIR}/target/JAVA_APP-1.2.${BUILD_NUMBER}.war ${NEXUS_PROTOCOL}://${NEXUS_URL}/repository/${NEXUS_REPOSITORY}/in/RAHAM/JAVA_APP/1.2.${BUILD_NUMBER}/JAVA_APP-1.2.${BUILD_NUMBER}.war

                        # List the target directory to confirm the file is downloaded
                        ls -al ${WORKSPACE_DIR}/target/
                        
                        # Deployment steps
                        ssh -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} root@${PRIVATE_IP} "${TARGET_HOST_PATH}/bin/shutdown.sh"
                        ssh -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} root@${PRIVATE_IP} "find ${TARGET_HOST_PATH}/webapps/ -type d -name 'JAVA_APP-1.2.*' -exec rm -rf {} +"
                        ssh -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} root@${PRIVATE_IP} "find ${TARGET_HOST_PATH}/webapps/ -type f -name 'JAVA_APP-1.2*.war' -exec rm -f {} +"
                        scp -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} ${WORKSPACE_DIR}/target/JAVA_APP-1.2.${BUILD_NUMBER}.war root@${PRIVATE_IP}:${TARGET_HOST_PATH}/webapps/
                        ssh -o StrictHostKeyChecking=no -i ${SSH_KEY_PATH} root@${PRIVATE_IP} "${TARGET_HOST_PATH}/bin/startup.sh"
                        '''
                    }
                }
            }
        }
 
        stage('Update pom.xml Version') {
            steps {
                script {
                    sh 'git clone https://github.com/SaravanaNani/jenkins-java-project.git'
                    sh '''
                    cd jenkins-java-project
                    git fetch --all
                    git checkout ${BRANCH_NAME}
                    echo "Before modification:"
                    sed -n '7p' pom.xml
                    perl -i -pe 'if ($. == 7) { s|<version>.*?</version>|<version>1.2.'${BUILD_NUMBER}'</version>| }' pom.xml
                    echo "After modification:"
                    sed -n '7p' pom.xml
                    git config user.name "SaravanaNani"
                    git config user.email "saravana08052002@gmail.com"
                    git add pom.xml
                    git commit -m "Update version to 1.2.${BUILD_NUMBER}"
                    '''
                    withCredentials([string(credentialsId: 'github-pat', variable: 'GITHUB_PAT')]) {
                        sh '''
                        cd jenkins-java-project
                        git remote set-url origin https://$GITHUB_PAT@github.com/SaravanaNani/jenkins-java-project.git
                        git push origin ${BRANCH_NAME}
                        '''
                    }
                }
            }
        }
    }
}
