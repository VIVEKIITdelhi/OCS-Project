// Get the GitHub orgname input form
const gitHubForm = document.getElementById('gitHubForm');

// Listen for submissions on GitHub orgname input form
gitHubForm.addEventListener('submit', (e) => {

    // Prevent default form submission action
    e.preventDefault();
    // Get the GitHub orgname input field on the DOM
    let orgInput = document.getElementById('orgInput');
    // Get the value of the GitHub orgname input field
    let gitHubOrg = orgInput.value;
    // Run GitHub API function, passing in the GitHub orgname
    requestUserRepos(gitHubOrg)
        // resolve promise then parse response into json
        .then(response => response.json())

        // resolve promise then iterate through json
        .then(data => {
            // update html with data from github
            for (let i in data) {
                // Get the ul with id of orgRepos

                if (data.message === "Not Found") {
                    let ul = document.getElementById('orgRepos');

                    // Create variable that will create li's to be added to ul
                    let li = document.createElement('li');

                    // Add Bootstrap list item class to each li
                    li.classList.add('list-group-item')
                    // Create the html markup for each li
                    li.innerHTML = (`
                <p><strong>No account exists with orgname:</strong> ${gitHubOrg}</p>`);
                    // Append each li to the ul
                    ul.appendChild(li);
                    break;
                } else {

                    let ul = document.getElementById('orgRepos');
                    let sortedData = data.sort((a, b) => b.forks_count - a.forks_count); // sort by forks_count in descending order
                    for (let i in sortedData) {
                        // create two variable for value of m and n
                        const forkcount = document.getElementById("n").value;
                        const oldestforker=document.getElementById("m").value;
                        let li = document.createElement('li');
                        li.classList.add('list-group-item');
                        // Listing the element in list
                        li.innerHTML = (`
                            <p><strong>Fork:</strong> ${sortedData[i].forks_count}</p>
                            <p><strong>Repo:</strong> ${sortedData[i].name}</p>
                            <p><strong>Description:</strong> ${sortedData[i].description}</p>
                            <p><strong>URL:</strong> <a href="${sortedData[i].html_url}">${sortedData[i].html_url}</a></p>
                            <p><h2><u>List of Oldest Forkers</u></h2></p>
                        `);
                        // Append each li to the ul
                        ul.appendChild(li);
                    
                        // request oldest forkers for this repository
                        requestOldestForker(sortedData[i].name, gitHubOrg, forkcount)
                            .then(oldestForkers => {
                                // add a span element for each oldest forker
                                for (let j in oldestForkers) {
                                    let span = document.createElement('span');
                                    span.innerHTML = "<strong>"+`(${oldestForkers[j].username})`+ "</strong>" +"<br/>";
                                    li.appendChild(span);
                                    if (j==oldestforker-1){
                                        break;
                                    }
                                }
                            });
                        // For giving number of repos as per value of n
                        if (i == forkcount - 1) {
                            break;
                        }
                    }
                    
                    break;
                }
            }
        })
})
// Function to fetch Repository
function requestUserRepos(orgname) {
    const accessToken = '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';
    const headers = new Headers();
    headers.append('Authorization', `Token ${accessToken}`);
    const options = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
    };
    return Promise.resolve(fetch(`https://api.github.com/orgs/${orgname}/repos`,options));
}
// Function to fetch oldest forkers
function requestOldestForker(repoName, orgName, m) {
    const accessToken = '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';
    const headers = new Headers();
    headers.append('Authorization', `Token ${accessToken}`);
    const options = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
    };
    return Promise.resolve(fetch(`https://api.github.com/repos/${orgName}/${repoName}/forks?per_page=100`,options))
    .then(response => response.json())
    .then(data => {
        // Sorting the forkers as per their date
        let oldestForkers = data
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .slice(0, m)
            .map(fork => ({ username: fork.owner.login, timestamp: fork.created_at }));
        return oldestForkers;
    });
}


  