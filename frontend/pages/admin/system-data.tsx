import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import {
  useComponents,
  useCreateComponent,
  useCreateIncident,
  useCreateRelease,
  useCreateSprint,
  useIncidents,
  useReleases,
  useSprints,
} from "@/hooks/useSystemData";

export default function AdminSystemDataPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: releases = [] } = useReleases();
  const { data: sprints = [] } = useSprints();
  const { data: components = [] } = useComponents();
  const { data: incidents = [] } = useIncidents();

  const createRelease = useCreateRelease();
  const createSprint = useCreateSprint();
  const createComponent = useCreateComponent();
  const createIncident = useCreateIncident();

  const [releaseName, setReleaseName] = useState("");
  const [releaseDescription, setReleaseDescription] = useState("");

  const [sprintName, setSprintName] = useState("");

  const [componentName, setComponentName] = useState("");
  const [componentDescription, setComponentDescription] = useState("");

  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "admin") return null;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Manage System Data</h1>
        <p className="section-subtitle">
          Admin can manage releases, sprints, components, and incidents
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <SectionCard title="Releases">
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
          >
            <div>
              <label>Name</label>
              <input
                value={releaseName}
                onChange={(e) => setReleaseName(e.target.value)}
                className="app-input"
              />
            </div>
            <div>
              <label>Description</label>
              <input
                value={releaseDescription}
                onChange={(e) => setReleaseDescription(e.target.value)}
                className="app-input"
              />
            </div>
          </div>

          <button
            className="app-button"
            style={{ marginTop: 16 }}
            onClick={async () => {
              if (!releaseName.trim()) return alert("Enter release name");
              try {
                await createRelease.mutateAsync({
                  name: releaseName,
                  description: releaseDescription || null,
                });
                setReleaseName("");
                setReleaseDescription("");
              } catch (err) {
                console.error(err);
                alert("Failed to create release");
              }
            }}
          >
            Add Release
          </button>

          <SimpleTable
            headers={["Name", "Description"]}
            rows={releases.map((item) => [item.name, item.description || "--"])}
          />
        </SectionCard>

        <SectionCard title="Sprints">
          <div>
            <label>Name</label>
            <input
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              className="app-input"
            />
          </div>

          <button
            className="app-button"
            style={{ marginTop: 16 }}
            onClick={async () => {
              if (!sprintName.trim()) return alert("Enter sprint name");
              try {
                await createSprint.mutateAsync({ name: sprintName });
                setSprintName("");
              } catch (err) {
                console.error(err);
                alert("Failed to create sprint");
              }
            }}
          >
            Add Sprint
          </button>

          <SimpleTable headers={["Name"]} rows={sprints.map((item) => [item.name])} />
        </SectionCard>

        <SectionCard title="Components">
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
          >
            <div>
              <label>Name</label>
              <input
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                className="app-input"
              />
            </div>
            <div>
              <label>Description</label>
              <input
                value={componentDescription}
                onChange={(e) => setComponentDescription(e.target.value)}
                className="app-input"
              />
            </div>
          </div>

          <button
            className="app-button"
            style={{ marginTop: 16 }}
            onClick={async () => {
              if (!componentName.trim()) return alert("Enter component name");
              try {
                await createComponent.mutateAsync({
                  name: componentName,
                  description: componentDescription || null,
                });
                setComponentName("");
                setComponentDescription("");
              } catch (err) {
                console.error(err);
                alert("Failed to create component");
              }
            }}
          >
            Add Component
          </button>

          <SimpleTable
            headers={["Name", "Description"]}
            rows={components.map((item) => [item.name, item.description || "--"])}
          />
        </SectionCard>

        <SectionCard title="Incidents">
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
          >
            <div>
              <label>Title</label>
              <input
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                className="app-input"
              />
            </div>
            <div>
              <label>Description</label>
              <input
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                className="app-input"
              />
            </div>
          </div>

          <button
            className="app-button"
            style={{ marginTop: 16 }}
            onClick={async () => {
              if (!incidentTitle.trim()) return alert("Enter incident title");
              try {
                await createIncident.mutateAsync({
                  title: incidentTitle,
                  description: incidentDescription || null,
                });
                setIncidentTitle("");
                setIncidentDescription("");
              } catch (err) {
                console.error(err);
                alert("Failed to create incident");
              }
            }}
          >
            Add Incident
          </button>

          <SimpleTable
            headers={["Title", "Description"]}
            rows={incidents.map((item) => [item.title, item.description || "--"])}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div style={{ overflowX: "auto", marginTop: 16 }}>
      <table className="app-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}