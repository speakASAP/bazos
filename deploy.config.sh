# deploy.config.sh — declaration consumed by shared/scripts/deploy.sh.
# See shared/docs/DEPLOY_STANDARDIZATION_REPORT.md section 6/7 for the design.
# scripts/deploy.sh is still the live, authoritative deploy path.
#
# Real script both sed-templates deployment.yaml AND calls kubectl set image
# (belt-and-suspenders) plus an observability annotation -- reproduced as-is
# rather than simplified, since that redundancy is presumably deliberate.

SERVICE_NAME="bazos-service"
PORT="3900"

IMAGES=(
  "bazos-service|.||"
)

DEPLOYMENTS=(
  "bazos-service|app|bazos-service"
)

MANIFESTS=(configmap.yaml external-secret.yaml service.yaml ingress.yaml)

deploy_post_manifests() {
  local image="${REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG}"
  if [ -f "$PROJECT_ROOT/k8s/deployment.yaml" ]; then
    sed -E "s#image: ${REGISTRY}/${SERVICE_NAME}:[^[:space:]]+#image: ${image}#" "$PROJECT_ROOT/k8s/deployment.yaml" \
      | kubectl apply -f - -n "$NAMESPACE"
  fi
}

deploy_post_verify() {
  kubectl annotate deployment/"$SERVICE_NAME" \
    "deploy.bazos-service/image-tag=${IMAGE_TAG}" \
    "deploy.bazos-service/restarted-at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    -n "$NAMESPACE" --overwrite
}
