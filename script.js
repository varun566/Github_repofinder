$(document).ready(function() {
    const repositoryList = $('#repositoryList');
    const pagination = $('#pagination');
    const loader = $('#loader');
    const reposPerPage = $('#reposPerPage');
    const search = $('#search');
    const olderBtn = $('#olderBtn');
    const newerBtn = $('#newerBtn');
    const currentPageDisplay = $('#currentPage');
    const totalPagesDisplay = $('#totalPages');

    let currentPage = 1;
    let currentReposPerPage = reposPerPage.val();
    let currentSearch = '';
    let totalCount = 0; // Initialize totalCount

    function fetchRepositories() {
        loader.show();
        $.get(`https://api.github.com/users/john-smilga/repos?page=${currentPage}&per_page=${currentReposPerPage}${currentSearch}`)
            .done(res => {
                totalCount = res.length; // Update totalCount
                displayRepositories(res);
                displayPagination(totalCount, currentReposPerPage, 10);
                loader.hide();
            })
            .fail(err => {
                console.error(err);
                loader.hide();
            });
    }

    function displayRepositories(repos) {
        repositoryList.empty();
        repos.forEach(repo => {
            const repoRow = `
                <tr>
                    <td>${repo.name}</td>
                    <td>${repo.description || ''}</td>
                    <td>${repo.stargazers_count}</td>
                    <td>${repo.forks_count}</td>
                </tr>
            `;
            repositoryList.append(repoRow);
        });
    }

    function displayPagination(totalCount, reposPerPage, maxPagesToShow) {
        const totalPages = Math.ceil(totalCount / reposPerPage);
        pagination.empty();

        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
            if (currentPage <= halfMaxPagesToShow) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + halfMaxPagesToShow >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - halfMaxPagesToShow;
                endPage = currentPage + halfMaxPagesToShow;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const li = $(`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`);
            if (i === currentPage) {
                li.addClass('active');
            }
            li.on('click', function(e) {
                e.preventDefault();
                currentPage = i;
                fetchRepositories();
            });
            pagination.append(li);
        }

        currentPageDisplay.text(currentPage);
        totalPagesDisplay.text(totalPages);
    }

    function filterRepositories() {
        currentPage = 1;
        currentSearch = `&q=${search.val()}`;
        fetchRepositories();
    }

    reposPerPage.on('change', function() {
        currentReposPerPage = $(this).val();
        currentPage = 1;
        fetchRepositories();
    });

    search.on('input', filterRepositories);

    olderBtn.on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            fetchRepositories();
        }
    });

    newerBtn.on('click', function() {
        const totalPages = Math.ceil(totalCount / currentReposPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            fetchRepositories();
        }
    });

    fetchRepositories();
});

const form = document.getElementById('repo-form');
const usernameInput = document.getElementById('username');
const reposDiv = document.getElementById('repos');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    const data = await response.json();
    displayRepos(data);
});

function displayRepos(repos) {
    reposDiv.innerHTML = '';
    if (repos.length === 0) {
        reposDiv.textContent = 'No repos found for this user.';
        return;
    }
    repos.forEach((repo) => {
        const repoDiv = document.createElement('div');
        repoDiv.textContent = repo.name;
        reposDiv.appendChild(repoDiv);
    });
}
