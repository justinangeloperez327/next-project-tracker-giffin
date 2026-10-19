import { requireUser } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { ProjectRegister } from "@/components/project-register";
export default async function Projects() {
  const user = await requireUser();
  return <ProjectRegister projects={await getProjects(user.id)} />;
}
