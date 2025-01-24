pipeline {
    agent { 
        label 'maven'  // Use your Maven server as the agent
    }

    environment {
        GITHUB_TOKEN = credentials('github-token-id')
    }

    stages {
        stage('Git Checkout') {
            steps {
                // This will checkout the code from the correct branch
                git url: 'https://github.com/vickeyys/jenkins-java-project-1.git', credentialsId: 'github-token-id'
            }
        }

        stage('Compile') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'prod') {
                        echo "Compiling for Production"
                        // Compile with prod profile
                        sh 'mvn clean compile -P prod'
                    } else if (env.BRANCH_NAME == 'stag') {
                        echo "Compiling for Staging"
                        // Compile with stag profile
                        sh 'mvn clean compile -P stag'
                    } else {
                        echo "No valid environment for branch: ${env.BRANCH_NAME}"
                    }
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'prod') {
                        echo "Running tests for Production"
                        // Test with prod profile
                        sh 'mvn test -P prod'
                    } else if (env.BRANCH_NAME == 'stag') {
                        echo "Running tests for Staging"
                        // Test with stag profile
                        sh 'mvn test -P stag'
                    } else {
                        echo "No valid environment for branch: ${env.BRANCH_NAME}"
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'prod') {
                        echo "Building for Production"
                        // Build with prod profile
                        sh 'mvn package -P prod'
                    } else if (env.BRANCH_NAME == 'stag') {
                        echo "Building for Staging"
                        // Build with stag profile
                        sh 'mvn package -P stag'
                    } else {
                        echo "No valid environment for branch: ${env.BRANCH_NAME}"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'prod') {
                        echo "Deploying to Production"
                        // Add your production deployment steps here
                    } else if (env.BRANCH_NAME == 'stag') {
                        echo "Deploying to Staging"
                        // Add your staging deployment steps here
                    } else {
                        echo "Branch ${env.BRANCH_NAME} is not recognized"
                    }
                }
            }
        }
    }
}
