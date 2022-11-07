pipeline {
	agent any

	tools {NodeJS "node"}

	stages {
		stage('Git') {
			steps {
				git 'https://github.com/vfalconi/whats-on-mpb-radio'
			}
		}

		stage('Build') {
			steps {
				sh 'npm install'
				sh 'npm run build'
			}
		}

		stage('Deploy') {
			steps {
				sh 'npm run deploy'
			}
		}
	}
}
