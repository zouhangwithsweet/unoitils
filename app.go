package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"strconv"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// handler excel
type TemplateData struct {
	Desc           []string `json:"desc"`
	HeaderTitle    string   `json:"headerTitle"`
	TopBlockTitles []string `json:"topBlockTitles"`
	Notice         string   `json:"notice"`
	HeadImg        string   `json:"headImg"`
}

type ResultData struct {
	HeadContent  string         `json:"headContent"`
	ContentBlock []ContentBlock `json:"contentBlock"`
	Notice       string         `json:"notice"`
	CityName     string         `json:"cityName"`
	CityId       string         `json:"cityId"`
	HeadImg      string         `json:"headImg"`
}

type ContentBlock struct {
	Tit1    string   `json:"tit1"`
	Tit2    string   `json:"tit2"`
	Tit3    string   `json:"tit3"`
	IconUrl string   `json:"iconUrl"`
	Desc    []string `json:"desc"`
}

var excelAbsPath string

func (a *App) SelectFile() (string, error) {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel (*.xlsx)",
				Pattern: "*.xlsx",
			},
		},
	})
	if err != nil {
		log.Println(err)

		return "", errors.New("please select a file")
	}
	excelAbsPath = selection

	if excelAbsPath == "" {
		return "", errors.New("please select a file")
	}
	return selection, nil
}

func (a *App) Convert(textTemplate string) string {
	var innerTemplate TemplateData

	if excelAbsPath == "" {
		log.Println("No such File")
		return ""
	}
	// set inner template
	json.Unmarshal([]byte(textTemplate), &innerTemplate)

	// read file
	xFile, err := excelize.OpenFile(excelAbsPath)
	if err != nil {
		log.Println(err)
		return ""
	}

	sheet := xFile.GetSheetName(0)

	rows, err := xFile.GetRows(sheet)
	if err != nil {
		log.Println(err)
		return ""
	}

	result := make(map[string]ResultData)

	for _, row := range rows[2:] {
		city := row[0]

		if city == "" {
			continue
		}

		desc := make([]string, 0)

		if row[5] != row[11] {
			desc = append(desc, replaceTpl(row[5], row[11], innerTemplate.Desc[0]))
		}

		if row[6] != row[12] {
			desc = append(desc, replaceTpl(row[6], row[12], innerTemplate.Desc[1]))
		}

		if row[7] != row[13] {
			desc = append(desc, replaceTpl(intVal(row[7]), intVal(row[13]), innerTemplate.Desc[2]))
		}

		if row[8] != row[14] {
			desc = append(desc, replaceTpl(intVal(row[8]), intVal(row[14]), innerTemplate.Desc[3]))
		}

		if row[9] != row[15] {
			desc = append(desc, replaceTpl(row[9], row[15], innerTemplate.Desc[4]))
		}

		if row[10] != row[16] {
			desc = append(desc, replaceTpl(row[10], row[16], innerTemplate.Desc[5]))
		}

		result[city] = ResultData{
			HeadContent: innerTemplate.HeaderTitle,
			ContentBlock: []ContentBlock{
				{
					Tit1:    innerTemplate.TopBlockTitles[0],
					Tit2:    innerTemplate.TopBlockTitles[1],
					Tit3:    innerTemplate.TopBlockTitles[2],
					IconUrl: "https://gift-static.hongyibo.com.cn/static/kfpub/5500/order-bg.png",
					Desc:    desc,
				},
			},
			Notice:   innerTemplate.Notice,
			CityName: row[1],
			CityId:   city,
			HeadImg:  innerTemplate.HeadImg,
		}
	}

	resultJSON, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		log.Println(err)
		return ""
	}
	return string(resultJSON)
}

func (a *App) SaveResult(content string) {
	dest, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: "result.json",
	})
	if err != nil {
		log.Println(err)
	}

	ioutil.WriteFile(dest, []byte(content), 0644)
}

func replaceTpl(a, b interface{}, strTpl string) string {
	res := strTpl
	res = strings.ReplaceAll(res, "{$0}", fmt.Sprintf("%v", a))
	res = strings.ReplaceAll(res, "{$1}", fmt.Sprintf("%v", b))
	return res
}

func intVal(val string) float64 {
	num, _ := strconv.ParseFloat(val[:len(val)-1], 64)
	return num
}
