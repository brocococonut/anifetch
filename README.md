# AniFetch

A simple anime searcher and downloader with inspiration from the android app [Anime Scrap](https://github.com/fakeyatogod/AnimeScrap). The easiest way to run this would be to build the docker image and use that.

An example of running this via Docker is as follows
```sh
# Clone the repository
git clone https://github.com/brocococonut/anifetch
# Enter the directory
cd anifetch

# Build the docker image
docker build .
# Output:
# ....
#  => exporting to image                                                                                                 0.0s
#  => => exporting layers                                                                                                0.0s
#  => => writing image sha256:e99fc99a150232eb0176d5ff3140cedc0c600167e0c61cc3e4cd1eff04c42b28

# Run the image
docker run -it \
  -p 4321:4321 \
  -v ./downloads:/downloads \
  -v ./logs:/logs \
  -e "LOG_DIR=/logs" \
  -e "OUT_FOLDER=/downloads" \
  -e "CONCURRENT_DL=4" \
  e99fc99a150232eb0176d5ff3140cedc0c600167e0c61cc3e4cd1eff04c42b28docker run -it \
  -p 4321:4321 \
  -v ./downloads:/downloads \
  -v ./logs:/logs \
  -e "LOG_DIR=logs" \
  -e "OUT_FOLDER=downloads" \
  -e "CONCURRENT_DL=4" \
  e99fc99a150232eb0176d5ff3140cedc0c600167e0c61cc3e4cd1eff04c42b28
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |