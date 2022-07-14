#! /bin/bash

docker run --rm -ti -v $(pwd)/app:/app bubblewrap $@
