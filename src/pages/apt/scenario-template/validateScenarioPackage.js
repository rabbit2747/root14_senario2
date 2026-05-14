function collectIds(items) {
  return new Set((items || []).map((item) => item.id));
}

function pushIfMissing(errors, condition, message) {
  if (!condition) errors.push(message);
}

export function validateScenarioPackage({ curriculum, practicalScenario }) {
  const errors = [];
  const warnings = [];

  pushIfMissing(errors, curriculum?.scenario?.id, 'curriculum.scenario.id is required');
  pushIfMissing(errors, curriculum?.scenario?.title, 'curriculum.scenario.title is required');
  pushIfMissing(errors, curriculum?.briefing, 'curriculum.briefing is required');
  pushIfMissing(errors, curriculum?.legacy3d, 'curriculum.legacy3d is required');
  pushIfMissing(errors, curriculum?.legacy3d?.url, 'curriculum.legacy3d.url is required');
  pushIfMissing(errors, Array.isArray(curriculum?.sessions), 'curriculum.sessions must be an array');
  pushIfMissing(errors, Array.isArray(curriculum?.conceptClass?.concepts), 'curriculum.conceptClass.concepts must be an array');
  pushIfMissing(errors, Array.isArray(practicalScenario?.zones), 'practicalScenario.zones must be an array');
  pushIfMissing(errors, Array.isArray(practicalScenario?.nodes), 'practicalScenario.nodes must be an array');
  pushIfMissing(errors, Array.isArray(practicalScenario?.edges), 'practicalScenario.edges must be an array');
  pushIfMissing(errors, Array.isArray(practicalScenario?.steps), 'practicalScenario.steps must be an array');

  const conceptZones = curriculum?.conceptClass?.infrastructure?.zones || [];
  const conceptBoundaries = curriculum?.conceptClass?.infrastructure?.boundaries || [];
  const concepts = curriculum?.conceptClass?.concepts || [];
  const legacySteps = curriculum?.legacy3d?.steps || [];
  const practicalZones = practicalScenario?.zones || [];
  const practicalNodes = practicalScenario?.nodes || [];
  const practicalEdges = practicalScenario?.edges || [];
  const practicalSteps = practicalScenario?.steps || [];

  const conceptZoneIds = collectIds(conceptZones);
  const conceptBoundaryIds = collectIds(conceptBoundaries);
  const practicalZoneIds = collectIds(practicalZones);
  const practicalNodeIds = collectIds(practicalNodes);
  const practicalEdgeIds = collectIds(practicalEdges);

  concepts.forEach((concept) => {
    pushIfMissing(errors, concept.id, 'concept.id is required');
    pushIfMissing(errors, concept.title, `concept ${concept.id || '(unknown)'} title is required`);

    (concept.focusZones || []).forEach((zoneId) => {
      if (!conceptZoneIds.has(zoneId)) {
        errors.push(`concept "${concept.id}" references missing concept zone "${zoneId}"`);
      }
    });

    (concept.focusBoundaries || []).forEach((boundaryId) => {
      if (!conceptBoundaryIds.has(boundaryId)) {
        errors.push(`concept "${concept.id}" references missing concept boundary "${boundaryId}"`);
      }
    });
  });

  if (legacySteps.length === 0) {
    warnings.push('curriculum.legacy3d.steps is empty');
  }

  practicalNodes.forEach((node) => {
    if (!practicalZoneIds.has(node.zoneId)) {
      errors.push(`node "${node.id}" references missing practical zone "${node.zoneId}"`);
    }
  });

  practicalEdges.forEach((edge) => {
    if (!practicalNodeIds.has(edge.source)) {
      errors.push(`edge "${edge.id}" references missing source node "${edge.source}"`);
    }
    if (!practicalNodeIds.has(edge.target)) {
      errors.push(`edge "${edge.id}" references missing target node "${edge.target}"`);
    }
  });

  practicalSteps.forEach((step) => {
    pushIfMissing(errors, step.id, 'step.id is required');
    pushIfMissing(errors, Number.isFinite(step.order), `step "${step.id || '(unknown)'}" order must be a number`);
    pushIfMissing(errors, step.title, `step "${step.id || '(unknown)'}" title is required`);

    (step.activeNodes || []).forEach((nodeId) => {
      if (!practicalNodeIds.has(nodeId)) {
        errors.push(`step "${step.id}" references missing active node "${nodeId}"`);
      }
    });

    (step.activeEdges || []).forEach((edgeId) => {
      if (!practicalEdgeIds.has(edgeId)) {
        errors.push(`step "${step.id}" references missing active edge "${edgeId}"`);
      }
    });
  });

  const conceptLabels = new Set(concepts.map((concept) => concept.title.toLowerCase()));
  const recommendedConcepts = curriculum?.recommendedConcepts || ['Supply Chain Attack', 'Trust Relationship', 'Token / SSO', 'CI/CD Pipeline'];
  recommendedConcepts.forEach((requiredConcept) => {
    if (!conceptLabels.has(requiredConcept.toLowerCase())) {
      warnings.push(`recommended concept is missing: ${requiredConcept}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
