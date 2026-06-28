import { createContext, useContext, useState } from 'react';
import {
  createDefaultMedia,
  galleryFilters,
  initialComments,
  initialProfile,
  initialProjects,
  slugify,
} from '../utils/mockData';

const PortfolioContext = createContext(null);

function makeUniqueProjectId(title, projects) {
  const baseId = slugify(title) || `project-${projects.length + 1}`;
  let nextId = baseId;
  let counter = 2;

  while (projects.some((project) => project.id === nextId)) {
    nextId = `${baseId}-${counter}`;
    counter += 1;
  }

  return nextId;
}

function defaultSort(left, right) {
  if (left.featured !== right.featured) {
    return Number(right.featured) - Number(left.featured);
  }

  return right.likes - left.likes;
}

export function PortfolioProvider({ children }) {
  const [projects, setProjects] = useState(initialProjects);
  const [profile, setProfile] = useState(initialProfile);
  const [commentsByProject, setCommentsByProject] = useState(initialComments);
  const [likedProjectIds, setLikedProjectIds] = useState(new Set(['campus-service-redesign']));

  const getProjectById = (projectId) => {
    return projects.find((project) => project.id === projectId) ?? null;
  };

  const isLiked = (projectId) => likedProjectIds.has(projectId);

  const getLikeCount = (projectId) => {
    const project = getProjectById(projectId);

    if (!project) {
      return 0;
    }

    return project.likes + (likedProjectIds.has(projectId) ? 1 : 0);
  };

  const toggleLike = (projectId) => {
    setLikedProjectIds((currentSet) => {
      const nextSet = new Set(currentSet);

      if (nextSet.has(projectId)) {
        nextSet.delete(projectId);
      } else {
        nextSet.add(projectId);
      }

      return nextSet;
    });
  };

  const addComment = (projectId, message) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return false;
    }

    setCommentsByProject((currentComments) => ({
      ...currentComments,
      [projectId]: [
        {
          id: `${projectId}-${Date.now()}`,
          author: 'anonim',
          message: trimmedMessage,
        },
        ...(currentComments[projectId] ?? []),
      ],
    }));

    return true;
  };

  const getVisibleProjects = ({ filterSlug, query = '', bestOnly = false, ownOnly = false } = {}) => {
    let nextProjects = [...projects];

    if (ownOnly) {
      nextProjects = nextProjects.filter((project) => project.creatorHandle === profile.username);
    }

    if (bestOnly) {
      nextProjects = nextProjects.filter((project) => project.bestProject);
    }

    if (filterSlug) {
      if (filterSlug === 'fyp') {
        nextProjects = nextProjects.filter((project) => project.featured);
      } else if (filterSlug === 'most-liked') {
        nextProjects = [...nextProjects].sort((left, right) => getLikeCount(right.id) - getLikeCount(left.id));
      } else {
        nextProjects = nextProjects.filter((project) => project.programSlug === filterSlug);
      }
    }

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      nextProjects = nextProjects.filter((project) => {
        return [project.title, project.programLabel, project.creatorName, project.description]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      });
    }

    if (filterSlug !== 'most-liked') {
      nextProjects = [...nextProjects].sort(bestOnly ? (left, right) => right.likes - left.likes : defaultSort);
    }

    return nextProjects;
  };

  const saveProject = (draft, projectId) => {
    const existingProject = projectId ? getProjectById(projectId) : null;
    const title = draft.title.trim() || 'Untitled Project';
    const nextId = existingProject ? existingProject.id : makeUniqueProjectId(title, projects);
    const nextMedia =
      draft.media.length > 0
        ? draft.media
        : existingProject?.media?.length
          ? existingProject.media
          : createDefaultMedia(title, projects.length);

    const nextProject = {
      id: nextId,
      title,
      creatorName: profile.name,
      creatorHandle: profile.username,
      programLabel: draft.programLabel,
      programSlug: slugify(draft.programLabel),
      publishDate: draft.publishDate,
      description: draft.description.trim(),
      media: nextMedia,
      likes: existingProject?.likes ?? 96,
      views: existingProject?.views ?? 720,
      featured: existingProject?.featured ?? false,
      bestProject: existingProject?.bestProject ?? false,
      thumbnailTone: nextMedia[0]?.tone ?? existingProject?.thumbnailTone ?? createDefaultMedia(title, 0)[0].tone,
    };

    setProjects((currentProjects) => {
      if (existingProject) {
        return currentProjects.map((project) => (project.id === nextId ? nextProject : project));
      }

      return [nextProject, ...currentProjects];
    });

    setCommentsByProject((currentComments) => ({
      ...currentComments,
      [nextId]: currentComments[nextId] ?? [],
    }));

    return nextId;
  };

  const deleteProject = (projectId) => {
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));

    setCommentsByProject((currentComments) => {
      const nextComments = { ...currentComments };
      delete nextComments[projectId];
      return nextComments;
    });

    setLikedProjectIds((currentSet) => {
      const nextSet = new Set(currentSet);
      nextSet.delete(projectId);
      return nextSet;
    });
  };

  const updateProfile = (draft) => {
    const nextProfile = {
      ...profile,
      ...draft,
      name: draft.name.trim(),
      program: draft.program.trim(),
      bio: draft.bio.trim(),
      website: draft.website.trim(),
      phone: draft.phone.trim(),
    };

    setProfile(nextProfile);

    setProjects((currentProjects) =>
      currentProjects.map((project) => ({
        ...project,
        creatorName: nextProfile.name,
        creatorHandle: nextProfile.username,
      })),
    );
  };

  const currentUserProjects = getVisibleProjects({ ownOnly: true });

  return (
    <PortfolioContext.Provider
      value={{
        commentsByProject,
        currentUserProjects,
        deleteProject,
        galleryFilters,
        getLikeCount,
        getProjectById,
        getVisibleProjects,
        isLiked,
        profile,
        projects,
        saveProject,
        toggleLike,
        updateProfile,
        addComment,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);

  if (!context) {
    throw new Error('usePortfolio must be used inside PortfolioProvider');
  }

  return context;
}
