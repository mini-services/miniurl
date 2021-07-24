{{- define "miniurl.appName" -}}
{{- printf "%s" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "miniurl.serviceName" -}}
{{- if .Values.service.name -}}
{{- .Values.service.name -}}
{{- else -}}
{{- include "miniurl.appName" . -}}-service
{{- end -}}
{{- end -}}

{{- define "miniurl.authToken" -}}
{{- if eq .Values.auth.driver "BearerToken" -}}
{{- if (not (empty .Values.auth.bearerTokenConfig.token)) -}}
{{- .Values.auth.bearerTokenConfig.token -}}
{{- else -}}
{{- randAlphaNum 18 -}}
{{- end -}}
{{- end -}}
{{- end -}}
 
# Sets either the default postgresql secret name (if deploying) or our own storage secret name
{{- define "miniurl.storageSecretName" -}}
{{- tpl .Values.postgresql.existingSecret . }}
{{- end -}}

{{- define "miniurl.validateStorageConfig" -}}
{{- if not .Values.storage.deploy -}}
{{- required "storage.postgresConfig.host is required when storage.driver is set to 'Postgres' and storage.deploy is set to false" .Values.storage.postgresConfig.host -}}
{{- required "storage.postgresConfig.user is required when storage.driver is set to 'Postgres' and storage.deploy is set to false" .Values.storage.postgresConfig.user -}}
{{- required "storage.postgresConfig.database is required when storage.driver is set to 'Postgres' and storage.deploy is set to false" .Values.storage.postgresConfig.database -}}
{{- end -}}
{{- end -}}