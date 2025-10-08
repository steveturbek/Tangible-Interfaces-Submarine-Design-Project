# TODO for project

- make win check target use vertical height -or grab target / some other challenge?
- **Known Issue**: When main page is reloaded while instruments window is open, the main window loses its reference to the instruments window. Current workaround: detect if load event doesn't fire within 1 second and alert user to close old window. Better solution would be cache-busting on script tags or a more robust window reconnection mechanism.
