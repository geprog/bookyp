# This file is used for local development (devcontainer)
FROM node:14.16.0-buster

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

# The node image comes with a base non-root 'node' user which this Dockerfile
# gives sudo access. However, for Linux, this user's GID/UID must match your local
# user UID/GID to avoid permission issues with bind mounts. Update USER_UID / USER_GID
# if yours is not 1000. See https://aka.ms/vscode-remote/containers/non-root-user.
ARG USER_UID=1000
ARG USER_GID=$USER_UI

# Configure apt and install packages
RUN apt-get update \
    && apt-get -y upgrade \
    #
    # add needed tools
    && apt-get -y install --no-install-recommends \
        openssh-client \
        ca-certificates \
        bash \
        bash-completion \
    #
    # cleanup
    && rm -rf /var/lib/apt/lists/* \
    && apt-get autoremove -y \
    && apt-get clean -y

# dependency manager
RUN curl -f https://get.pnpm.io/v6.js | node - add --global pnpm@6

# enable bash completion
RUN echo "if [ -f /etc/bash_completion ]; \n then . /etc/bash_completion \nfi" >> ~/.bashrc

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=

# Command so things don't shut down after the process ends
CMD ["sleep", "infinity"]
