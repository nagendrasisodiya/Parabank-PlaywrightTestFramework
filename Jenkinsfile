pipeline {
agent any

tools {
    allure 'Allure'
    nodejs "Node22"
}

stages {

    stage('Checkout Source') {
        steps {
            checkout scm
        }
    }

    stage('Install Dependencies') {
        steps {
            bat 'npm ci'
        }
    }

    stage('Install Playwright Browsers') {
        steps {
            bat 'npx playwright install'
        }
    }

    stage('Run Playwright Tests') {
        steps {
            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                bat 'npx playwright test'
            }
        }
    }
}

post {

    always {

        allure(
            includeProperties: false,
            jdk: '',
            results: [[path: 'allure-results']]
        )

        publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Report'
        ])

        archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
        archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
    }

    success {
        echo 'Playwright execution completed successfully.'
    }

    unstable {
        echo 'Some tests failed, but reports were generated.'
    }

    failure {
        echo 'Pipeline failed.'
    }
}
}