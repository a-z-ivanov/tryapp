Hello!
to set process vars in node use:
USER_ID=239482 USER_KEY=foobar node app.js


todo:

- on move only redraw tiles and their objects that need redraw
- write map functions that can update only parts of the data (e.g. players)
- keep move clientside and only update map for other players when the
player have played enough move points from cards
    - if he fails to play the cards revert map (again clientside only)

done:


