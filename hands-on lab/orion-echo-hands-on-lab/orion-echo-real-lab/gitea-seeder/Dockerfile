FROM gitea/gitea:1.22-rootless

USER root
WORKDIR /seed
COPY seed_gitea.sh .
RUN chmod +x /seed/seed_gitea.sh
USER git
ENTRYPOINT ["/seed/seed_gitea.sh"]
