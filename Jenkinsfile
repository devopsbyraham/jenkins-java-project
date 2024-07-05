pipeline {
    agent {
        label 'docker'
    }
    tools {
        maven 'maven' // Use the name configured in Jenkins
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

        
        stage('Package') {
            steps {
                sh '''
                cd /var/lib/jenkins/workspace/adq-java-app/
                mvn compile
                mvn test
                mvn package
                '''                
            }
        }
        stage('Rename and Upload WAR') {
            steps {
                script {
                    // Rename the WAR file
                    sh '''
                    cd /var/lib/jenkins/workspace/adq-java-app/target/
                    mv JAVA_APP-1.2.*.war JAVA_APP-1.2.${BUILD_NUMBER}.war
                    '''

                    // Set the path of the artifact and upload path
                    def artifactPath = "/var/lib/jenkins/workspace/adq-java-app/target/JAVA_APP-1.2.${BUILD_NUMBER}.war"
                    def uploadPath = "${BRANCH_NAME}/target/JAVA_APP-1.2.${BUILD_NUMBER}.war"

                    // Upload to Google Cloud Storage using gsutil
                    sh """
                    /google-cloud-sdk/bin/gsutil  cp ${artifactPath} gs://adq-java-app/${uploadPath}
                    """
                }
            }
        }

        stage('Confirm and Get Private IP') {
            steps {
                script {
                    input message: 'Are you sure you want to proceed with the deployment?', ok: 'Yes'
                    
                    def instanceName = "get-ubuntudesktop"
                    def projectId = "gcp-adq-pocproject-dev"
                    def zone = "us-central1-c"

                    def instanceStatus = sh(script: "gcloud compute instances describe ${instanceName} --project=${projectId} --zone=${zone} --format='get(status)'", returnStdout: true).trim()
                    
                    if (instanceStatus != 'RUNNING') {
                        error "VM instance is not running. Deployment stopped."
                    }

                    env.PRIVATE_IP = sh(script: '''
                        gcloud compute instances list --filter="labels.adq-ubuntudesktop=env" --format="value(networkInterfaces[0].networkIP)" --limit=1
                    ''', returnStdout: true).trim()

                    echo "Private IP: ${env.PRIVATE_IP}"
                }
            }
        }

        stage('Deploy and Restart Tomcat') {
            steps {
                script {
                    sh '''
                    # Remove all .war files in the target directory
                    rm -f /var/lib/jenkins/workspace/adq-java-app/target/*.war
                    
                    # Get WAR from Artifactory
                    /google-cloud-sdk/bin/gsutil cp gs://adq-java-app/${BRANCH_NAME}/target/JAVA_APP-1.2.${BUILD_NUMBER}.war /var/lib/jenkins/workspace/adq-java-app/target/
                    ls -al /var/lib/jenkins/workspace/adq-java-app/target/
                    
                    # Shutdown Tomcat
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_rsa root@${PRIVATE_IP} '/root/apache-tomcat-9.0.89/bin/shutdown.sh'

                    # Remove old WAR files and directories
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_rsa root@${PRIVATE_IP} "find /root/apache-tomcat-9.0.89/webapps/ -type d -name 'JAVA_APP-1.2.*' -exec rm -rf {} +"
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_rsa root@${PRIVATE_IP} "find /root/apache-tomcat-9.0.89/webapps/ -type f -name 'JAVA_APP-1.2*.war' -exec rm -f {} +"

                    # Deploy the new WAR file
                    scp -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_rsa /var/lib/jenkins/workspace/adq-java-app/target/JAVA_APP-1.2.${BUILD_NUMBER}.war root@${PRIVATE_IP}:/root/apache-tomcat-9.0.89/webapps/

                    # Start Tomcat
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/id_rsa root@${PRIVATE_IP} '/root/apache-tomcat-9.0.89/bin/startup.sh'
                    '''
                }
            }
        }

        stage('Update pom.xml Version') {
            steps {
                script {
                    // Clone the repository
                    sh 'git clone https://github.com/SaravanaNani/jenkins-java-project.git'
                    
                    // Update the pom.xml with the new version
                    sh '''
                    cd jenkins-java-project
                    git fetch --all
                    git checkout ${BRANCH_NAME}
                    # Debug before modification
                    echo "Before modification:"
                    sed -n '7p' pom.xml  # Print line 7 before modification

                    # Update line 7 with the new version
                    perl -i -pe 'if ($. == 7) { s|<version>.*?</version>|<version>1.2.'${BUILD_NUMBER}'</version>| }' pom.xml

                    # Debug after modification
                    echo "After modification:"
                    sed -n '7p' pom.xml  # Print line 7 after modification
                    git config user.name "SaravanaNani"
                    git config user.email "saravana08052002@gmail.com"
                    git add pom.xml
                    git commit -m "Update version to 1.2.${BUILD_NUMBER}"
                    '''
                    
                    // Push the changes using the stored credentials
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
