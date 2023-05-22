Contributing to the portal Project

- [1. Introduction](#1-introduction)
- [2. Contributing code via GitHub](#2-contributing-code-via-github)
- [3. Reporting Bugs](#3-reporting-bugs)

# 1. Introduction

We welcome any help, for example contributing feature implementations, bug fixes and bug reports.

Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

# 2. Contributing code via GitHub

Code contributions can be performed via _pull requests_ (PR) exclusively.
As a rule-of-thumb:

- PRs should be kept at a manageable size.
- Try to focus on just one goal per PR. If you find yourself doing several things in a PR that were not expected,
  then try to split the different tasks into different PRs.
- Commits should always change a _single_ logical unit so that cherry-picking & reverting is simple.
- Commit messages should be as informative and concise as possible. The first line of the commit message should be < 80 characters and
  describe the commit briefly. If the 80 characters are too short for a summary, then consider splitting the commit.
  Optionally, add one blank line below the short summary and write a more detailed explanation if necessary.

Below we outline the recommended steps in the code contribution workflow. We use `your-username` to refer to your username on GitHub, `portal_upstream` is used when we
set the upstream remote repository for Portal (we could have picked any name but try to avoid already used names like, in particular, `origin` and `master`), and
we use the name `my-new-feature` for the branch that we create (e.g., the branch name should reflect the code change being made, keybraker-updating-music-player).

**Important**: If your PR lives for a long time, then don't press the button _Update branch_ in the Pull Request view, instead follow the steps below, as
that avoids additional merge commits.

Once you have a GitHub login:

1.  Fork Portal git repository to your GitHub account by pressing the _Fork_ button at: [https://github.com/keybraker/portal](https://github.com/keybraker/portal)

2.  Then start a terminal (or use your favorite git GUI app) and clone your fork of Portal:

        $ git clone https://github.com:your-username/portal.git
        $ cd porrtal

3.  Add a new remote pointing to master Portal repository:

        $ git remote add portal_upstream https://github.com/keybraker/portal.git

    and verify that you have the two remotes configured correctly:

        $ git remote -v
        portal_upstream  https://github.com/keybraker/portal.git (fetch)
        portal_upstream  https://github.com/keybraker/portal.git (push)
        origin  https://github.com/your-username/portal.git (fetch)
        origin  https://github.com/your-username/portal.git (push)

4.  Next, create a branch for your PR from `portal_upstream/master` (which we also need to fetch first):

        $ git fetch portal_upstream master
        $ git checkout -b my-new-feature portal_upstream/master --no-track

    NB: This is an important step to avoid draging in old commits!

5.  Configure the project and check that it builds (if not, please report a bug):

        $ npm install

6.  Now, make your change(s), add tests for your changes, and commit each change:

        ...

        $ git commit -m "Commit message 1"

        ...

        $ git commit -m "Commit message 2"

7.  If your feature or update is event-free add testing for your changes to corresponding test file or a new file (if necessary)

8.  Make sure all tests pass

        $ npm test

9.  Push the changes to your fork on GitHub:

        $ git push origin my-new-feature

10. Create the PR by pressing the _New pull request_ button on: `https://github.com/your-username/portal`.
    Please select the option "Allow edits from maintainers" as outlined [here](https://help.github.com/en/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork).

11. Now wait for a portal project member(s) to respond to your PR. Follow the discussion on your PR at [GitHub](https://github.com/keybraker/portal/pulls).
    You may have to do some updates to your PR until it gets accepted. If you are inactive for more than three days the pull request is rejected.

12. After the PR has been reviewed you must _rebase_ your repo copy or merge with dev since there may have been several changes to the upstream repository.

    Switch to your branch again

        $ git checkout my-new-feature

    And rebase it on top of master:

        $ git pull --rebase portal_upstream master

    When you perform a rebase the commit history is rewritten and, therefore, the next time you try to push your branch to your fork repository you will need to use
    the `--force-with-lease` option:

        $ git push --force-with-lease

    ***

    Alternatively you can merge master to your local branch

        $ git checkout master
        $ git pull

    And now merge with your branch

        $ git merge origin/master

    > ensuring your changes are in sync with remote master is mandatory for your commit to pass
    > be aware that conflicts may apear which you must solve before creating a pull request

# 3. Reporting Bugs

Bugs should be reported by creating Issues on GitHub.

> before reporting a bug first check the issue list if the bug is already known<br>
> If you cannot find any previous bug report, create a new Issue. When reporting a bug
> try to describe the problem in as much detail as possible and if the bug is triggered
> by an input file then attach that file to the GitHub issue if possible.
