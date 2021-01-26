# This file is used for local development (devcontainer)
FROM node:lts

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

# Install current version of Git
ENV GIT_VERSION 2.30.0

RUN apt-get update \
    && apt-get -y upgrade \
    #
    # add needed tools for git make
    && apt-get -y install --no-install-recommends \
        gettext \
        libssl-dev \
        libghc-zlib-dev \
        libcurl4-gnutls-dev \
        libexpat1-dev \
    #
    # Download and build git
    && wget https://github.com/git/git/archive/v$GIT_VERSION.tar.gz -O git.tar.gz \
    && tar -xf git.tar.gz \
    && cd git-* \
    && make prefix=/usr/local all \
    && make prefix=/usr/local install \
    #
    # cleanup
    && rm -rf /var/lib/apt/lists/* \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && cd .. \
    && rm git.tar.gz \
    && rm -R git-*

# enable bash completion
RUN echo "if [ -f /etc/bash_completion ]; \n then . /etc/bash_completion \nfi" >> ~/.bashrc

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=

# Command so things don't shut down after the process ends
CMD ["sleep", "infinity"]
