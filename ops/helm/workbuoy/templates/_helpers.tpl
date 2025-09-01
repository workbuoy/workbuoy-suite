{{- define "workbuoy.name" -}}
workbuoy
{{- end -}}

{{- define "workbuoy.fullname" -}}
{{- printf "%s" (include "workbuoy.name" .) -}}
{{- end -}}
