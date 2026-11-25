{{/*
Create a default fully qualified app name.
Kubernetes name fields are limited to 63 charactes (by the DNS naming spec).
We truncate at 31 chars to and we want to leave 32 chars space for internal suffixes.
*/}}
{{- define "bookyp.fullname" -}}
{{- (printf "bookyp-%s" .Values.environment.name) | trunc 31 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "bookyp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "bookyp.labels" -}}
helm.sh/chart: {{ include "bookyp.chart" . }}
{{ include "bookyp.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "bookyp.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
App selector labels
*/}}
{{- define "bookyp.selectorLabelsApp" -}}
{{ include "bookyp.selectorLabels" . }}
app.kubernetes.io/package: app
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "bookyp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "bookyp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create fully qualified app URL.
We truncate the environment name at 63 chars,
because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "bookyp.appURL" -}}
{{- if eq .Values.environment.type "production" }}
{{- printf "app.bookyp.de" }}
{{- else }}
{{- printf "%s.app.bookyp.de" (.Values.environment.name | trunc 63 | trimSuffix "-") }}
{{- end }}
{{- end }}

{{/*
Special annotations to support gitlab kubernetes integration
*/}}
{{- define "bookyp.gitlabAnnotations" -}}
{{- if and .Values.gitlab.app .Values.gitlab.env }}
app.gitlab.com/app: {{ .Values.gitlab.app | quote }}
app.gitlab.com/env: {{ .Values.gitlab.env | quote }}
{{- end }}
{{- end }}

{{/*
Combine DB credentials to a mongo database URI
*/}}
{{- define "bookyp.databaseURI" -}}
{{- $dbHost := .Values.app.database.host -}}
{{- $dbName := default (include "bookyp.fullname" .) .Values.app.database.name -}}
{{- $dbUser := default (include "bookyp.fullname" .) .Values.app.database.username -}}
{{- $dbPassword := .Values.app.database.password -}}
{{ printf "mongodb://%s:%s@%s/%s" $dbUser $dbPassword $dbHost $dbName }}
{{- end }}
