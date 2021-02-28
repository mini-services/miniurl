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
{{- if .Values.storage.deploy -}}
{{- printf "%s-%s" .Release.Name "postgresql" | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- include "miniurl.appName" . -}}-storage-secret
{{- end -}}
{{- end -}}

{{- define "miniurl.validateStorageConfig" -}}
{{- if not .Values.storage.deploy -}}
{{- required "storage.relationalConfig.client is required when storage.driver is set to 'Relational' and storage.deploy is set to false" .Values.storage.relationalConfig.client -}}
{{- required "storage.relationalConfig.host is required when storage.driver is set to 'Relational' and storage.deploy is set to false" .Values.storage.relationalConfig.host -}}
{{- required "storage.relationalConfig.user is required when storage.driver is set to 'Relational' and storage.deploy is set to false" .Values.storage.relationalConfig.user -}}
{{- required "storage.relationalConfig.database is required when storage.driver is set to 'Relational' and storage.deploy is set to false" .Values.storage.relationalConfig.database -}}
{{- end -}}
{{- end -}}