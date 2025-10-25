node {
    def mavenHome = tool name: 'maven_3.9.11', type:'maven'
    
    try {
    
        stage('checkout') {
            git branch: 'deployement', url: 'https://github.com/Nandeesh94/jenkins-java-project.git'
        }
        stage('build') {
            sh "${mavenHome}/bin/mvn clean package"
        }
        stage('sonarqube report') {
            sh "${mavenHome}/bin/mvn clean sonar:sonar"
        }
        stage('upload to nexus') {
            sh "${mavenHome}/bin/mvn clean deploy"
        }
        stage('upload to tomcat') {
            withCredentials([usernamePassword(credentialsId:'tomcat-deployer',usernameVariable: 'DEPLOY_USER',passwordVariable: 'DEPLOY_PASS')]) {
            sh """
            curl -u $DEPLOY_USER:$DEPLOY_PASS \
            --upload-file /var/lib/jenkins/workspace/jio-declarative-pipeline/target/netflix-clone.war \
            "http://3.129.52.3:8080/manager/text/deploy?path=/netflix-clone&update=true"
            """
            }
        }
        stage('verify deployment') {
            sh "curl -I http://3.129.52.3:8080/netflix-clone/"
        }
      } catch (err) {
          error "Pipeline failed: ${err}"
      }
   }
