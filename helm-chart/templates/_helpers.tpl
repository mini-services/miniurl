{{- define "miniurl.appName" -}}
{{- printf "%s" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "miniurl.serviceName" -}}
{{ if .Values.service.name }}
{{ .Values.service.name }}
{{ else }}
{{ include "miniurl.appName" . }}-service
{{ end }}
{{- end -}}
