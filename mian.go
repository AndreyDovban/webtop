package main

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
)

type WtopData struct {
	Srot    string   `json:"sort"`
	Columns []string `json:"columns"`
}

var coms = []string{"ps",
	"h",
	"-eo",
	// "pid,ppid,uid,user,ruid,ruser,suid,gid,group,pgrp,tty,tpgid,sid,ni,%cpu,time,%mem,s,command,wchan,flags,tgid,environ,lxc,exe,rss,pss,uss,cuu,cuc",
	"pid,user,%mem,cuu,cuc,gid,group,pgrp,tty,time,s,wchan,flags,tgid,environ,lxc",
	"--sort",
	"pid",
}

func main() {

	mux := http.NewServeMux()
	mux.HandleFunc("/", home)
	mux.HandleFunc("/api/data", api)

	mux.Handle("/static*", http.NotFoundHandler())
	mux.Handle("/static/", http.StripPrefix("/static", http.FileServer(neuteredFileSystem{http.Dir("./static/")})))
	log.Println("http://localhost:5000")
	err := http.ListenAndServe(":5000", mux)
	if err != nil {
		log.Panicln(err.Error())
	}

}

type neuteredFileSystem struct {
	fs http.FileSystem
}

func (nfs neuteredFileSystem) Open(path string) (http.File, error) {
	f, err := nfs.fs.Open(path)
	if err != nil {
		return nil, err
	}

	s, _ := f.Stat()
	if s.IsDir() {
		index := filepath.Join(path, "index.html")
		if _, err := nfs.fs.Open(index); err != nil {
			closeErr := f.Close()
			if closeErr != nil {
				return nil, closeErr
			}

			return nil, err
		}
	}

	return f, nil
}

func home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	ts, err := template.ParseFiles("index.html")
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Internal Server Error", 500)
		return
	}
	// result, _ := execCommand(coms)

	err = ts.Execute(w, nil)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Internal Server Error", 500)
	}
}

func api(w http.ResponseWriter, r *http.Request) {

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Println(err.Error())
	}

	var wtd WtopData
	err = json.Unmarshal(body, &wtd)
	if err != nil {
		log.Println(err.Error())
	}
	res := ""
	for i, v := range wtd.Columns {
		if i != 0 {
			res += "," + v
		} else {
			res += v
		}
	}
	coms[3] = res

	if wtd.Srot != "" {
		coms[5] = wtd.Srot
	}
	// coms[4] = "pid"

	result, _ := execCommand(coms)

	w.Write(result)
}

func execCommand(cmd []string) ([]byte, error) {
	executer := exec.Command(cmd[0], cmd[1:]...)
	stdout, _ := executer.StdoutPipe()
	executer.Start()

	// b := exec.Command("head", "--line=30")
	// b.Stdin = stdout
	// stdout2, _ := executer.StdoutPipe()
	// b.Start()

	h := exec.Command("jq", "-Rn", "[inputs|.]")
	h.Stdin = stdout
	hh, _ := h.Output()
	return hh, nil
}
