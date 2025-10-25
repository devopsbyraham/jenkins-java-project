pipeline {
    agent any
    
    tools {
        maven 'maven'
    }
    
    stages {
        stage('code') {
            steps {
                git url: 'https://github.com/devopsbyraham/jenkins-java-project.git'
            }
        }
        stage('build') {
            steps {
                sh 'mvn compile'
            }
        }
        stage('test') {
            steps {
                sh 'mvn test'
            }
        }
        stage('artifact') {
            steps {
                sh 'mvn package'
            }
        }
        stage('s3') {
            steps {
                s3Upload consoleLogLevel: 'INFO', dontSetBuildResultOnFailure: false, dontWaitForConcurrentBuildCompletion: false, entries: [[bucket: 'artifactbucketfornetflixapp', excludedFile: '', flatten: false, gzipFiles: false, keepForever: false, managedArtifacts: false, noUploadOnFailure: false, selectedRegion: 'ap-south-1', showDirectlyInBrowser: false, sourceFile: 'target/NETFLIX-1.2.2.war', storageClass: 'STANDARD', uploadFromSlave: false, useServerSideEncryption: false]], pluginFailureResultConstraint: 'FAILURE', profileName: 'raham', userMetadata: []
            }
        }
        stage('deploy') {
            steps {
                echo "my code is deployed"
            }
        }
    }
}
