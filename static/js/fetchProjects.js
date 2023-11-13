// check for dark mode
var darkMode = false;

function setCookie(){
  if(darkMode){
    Cookies.set('darkMode', 'true', { expires: 7 });
  } else{
    Cookies.set('darkMode', 'false', { expires: 7 });
  }
}


function toggleDarkMode(){
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode');
  var heading = document.getElementById('theme-toggle');
  heading.textContent = darkMode ? "Light Mode" : "Dark Mode";
  // Re-initialize the lastTime to update the canvas immediately
  lastTime = Date.now();
  setCookie();
  console.log('darkMode set to ' + Cookies.get('darkMode'));
}

console.log('cookies darkmode is ' + Cookies.get('darkMode'));

// check for existing
if(Cookies.get('darkMode'=='undefined')){
  setCookie();
  document.getElementById('theme-toggle').textContent="Dark Mode";
}else{
  var trueDark = Cookies.get('darkMode')=='true';
  if(trueDark){
    toggleDarkMode();
  }else{
    document.getElementById('theme-toggle').textContent="Dark Mode";
  }
  setCookie();
}

document.getElementById('theme-toggle').addEventListener('click', function() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode');
  var heading = document.getElementById('theme-toggle');
  heading.textContent = darkMode ? "Light Mode" : "Dark Mode";
  // Re-initialize the lastTime to update the canvas immediately
  lastTime = Date.now();
  setCookie();
  console.log('darkMode set to ' + Cookies.get('darkMode'));
});


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
        projectLink.setAttribute("target", "_blank");
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