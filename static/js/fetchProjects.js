fetch('static/projects/projects.json')
    .then(response => response.json())
    .then(projects => {
      projects.forEach(project => {
        // Create elements
        const projectDiv = document.createElement('div');
        const projectName = document.createElement('h3');
        const projectDesc = document.createElement('p');
        const projectLink = document.createElement('a');
        const projectTechs = document.createElement('ul');

        // Assign content from JSON
        projectName.textContent = project.name;
        projectDesc.textContent = project.description;
        projectLink.href = project.URL;
        projectLink.appendChild(projectName);
        project.technologies.forEach(tech => {
          const techItem = document.createElement('li');
          techItem.textContent = tech;
          projectTechs.appendChild(techItem);
        });

        // Append to projectDiv
        projectDiv.appendChild(projectLink);
        projectDiv.appendChild(projectDesc);
        //projectDiv.appendChild(projectLink);
        projectDiv.appendChild(projectTechs);

        // Add classes for styling if necessary
        projectDiv.className = 'project';
        projectName.className = 'project-name';
        projectDesc.className = 'project-description';
        projectLink.className = 'project-link';
        projectTechs.className = 'project-technologies';

        // Append to the portfolio section
        document.getElementById('portfolio-section').appendChild(projectDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching the projects:', error);
    });