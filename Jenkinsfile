pipeline {
  agent any

  environment {
    IMAGE_NAME = 'taskflow-api'
    MONGO_URI  = credentials('mongo-uri')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build Docker') {
      steps {
        sh """
          docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:build-${BUILD_NUMBER} .
        """
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up -d --no-deps api'
      }
    }

    stage('Notify') {
      steps {
        echo "TaskFlow API build #${BUILD_NUMBER} deployed successfully."
        echo "Application available at: http://localhost/api/tasks"
      }
    }
  }

  post {
    always {
      echo "Build #${BUILD_NUMBER} complete — coverage report available in the coverage/ directory"
    }
    success {
      echo "Build #${BUILD_NUMBER} succeeded. TaskFlow API is live at http://localhost/api/tasks"
    }
    failure {
      echo "Build #${BUILD_NUMBER} failed. Check the console output above for the failing stage."
    }
  }
}
